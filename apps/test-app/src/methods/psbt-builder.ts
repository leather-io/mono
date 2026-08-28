// The PSBT builder: one panel covering the whole `signPsbt` request space.
//
// Input set × count × sighash flag × whether the request whitelists that flag
// × outputs × signAtIndex × account × broadcast. Every hand-written signPsbt
// entry was a point in here, and so was every cell of the old sighash matrix —
// a flag is just one field of an input, so the two panels are one.
//
// WHAT THE WALLETS DO with `allowedSighash`, which the expectations record:
//
// - Extension: the param is IGNORED. bitcoin.hooks.ts passes its own
//   `allSighashTypes` to `signIdx`, so every flag signs whether or not the dApp
//   whitelisted it. A non-ALL flag only raises the generic "details are not
//   guaranteed" callout (`isPsbtMutable`).
// - Mobile: it IS forwarded to `signIdx`, so @scure refuses any flag that is
//   not whitelisted — and, because signer.ts swallows the throw, the input
//   silently comes back unsigned rather than as an error.
// - Descriptor inputs: `getDescriptorInputsWithDisallowedSighash` only drives
//   the warning label; the extension still signs them.
import { collectPsbtKeys } from '../builders/keys';
import { type PsbtInputConfig, type PsbtOutputConfig, buildPsbtScenario } from '../builders/psbt';
import { type BuilderSelection, type SpecBuilder, builderSpecId } from '../builders/spec-builder';
import { SIGHASH, SIGHASH_NAMES } from '../constants';
import type { Expectation, ParamsOf, RpcMethodSpec } from '../types';
import { verifySignedPsbt } from '../verifiers/spec-verifiers';

const unset = 'unset';

interface InputSet {
  slug: string;
  label: string;
  /** Inputs, before the count and the sighash flag are applied. */
  inputs: PsbtInputConfig[];
  /** Whether repeating the input makes sense. */
  countable: boolean;
  /** Indexes the wallet should be able to sign. */
  signable(count: number): number[];
  /** Taproot inputs accept the DEFAULT flag; segwit v0 does not. */
  taproot?: boolean;
  /** The wallet needs a descriptor to recognise the script. */
  needsDescriptor?: boolean;
  vault?: 'synthetic';
}

const inputSets: InputSet[] = [
  {
    slug: 'p2wpkh',
    label: 'p2wpkh (native segwit)',
    inputs: [{ kind: 'p2wpkh' }],
    countable: true,
    signable: count => range(count),
  },
  {
    slug: 'p2tr',
    label: 'p2tr (taproot key-path)',
    inputs: [{ kind: 'p2tr' }],
    countable: true,
    taproot: true,
    signable: count => range(count),
  },
  {
    slug: 'wsh-pk',
    label: 'wsh(pk) (descriptor)',
    inputs: [{ kind: 'wsh-pk' }],
    countable: true,
    needsDescriptor: true,
    signable: count => range(count),
  },
  {
    slug: 'sortedmulti',
    label: 'wsh(sortedmulti) vault',
    inputs: [{ kind: 'sortedmulti' }],
    countable: true,
    needsDescriptor: true,
    vault: 'synthetic',
    signable: count => range(count),
  },
  {
    slug: 'mixed',
    label: 'mixed p2wpkh + p2tr',
    inputs: [{ kind: 'p2wpkh' }, { kind: 'p2tr' }],
    countable: false,
    taproot: true,
    signable: () => [0, 1],
  },
  {
    slug: 'with-foreign',
    label: 'p2wpkh + a foreign input',
    inputs: [{ kind: 'p2wpkh' }, { kind: 'foreign' }],
    countable: false,
    // Input 1 belongs to a key the wallet does not hold; signing it would mean
    // signing blind.
    signable: () => [0],
  },
];

function range(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index);
}

function inputSetOf(selection: BuilderSelection): InputSet {
  return inputSets.find(set => set.slug === selection.inputs) ?? inputSets[0];
}

const sighashOptions = [
  { value: unset, label: 'not set (wallet default)' },
  { value: SIGHASH.DEFAULT, label: 'DEFAULT', slug: 'default' },
  { value: SIGHASH.ALL, label: 'ALL', slug: 'all' },
  { value: SIGHASH.NONE, label: 'NONE', slug: 'none' },
  { value: SIGHASH.SINGLE, label: 'SINGLE', slug: 'single' },
  { value: SIGHASH.ALL_ANYONECANPAY, label: 'ALL | ANYONECANPAY', slug: 'all-acp' },
  { value: SIGHASH.NONE_ANYONECANPAY, label: 'NONE | ANYONECANPAY', slug: 'none-acp' },
  { value: SIGHASH.SINGLE_ANYONECANPAY, label: 'SINGLE | ANYONECANPAY', slug: 'single-acp' },
];

const outputSets: Record<string, { label: string; outputs: PsbtOutputConfig[] }> = {
  self: { label: 'back to you', outputs: [{ kind: 'self' }] },
  split: {
    label: 'two outputs to you',
    outputs: [{ kind: 'self', amount: 40_000n }, { kind: 'self' }],
  },
  foreign: {
    label: 'a payment + change',
    outputs: [{ kind: 'foreign', amount: 20_000n }, { kind: 'self' }],
  },
  'op-return': {
    label: 'payment + OP_RETURN + change',
    outputs: [{ kind: 'foreign', amount: 20_000n }, { kind: 'op-return' }, { kind: 'self' }],
  },
};

function mismatchFlagFor(flag: number): number {
  return flag === SIGHASH.ALL ? SIGHASH.NONE : SIGHASH.ALL;
}

function sighashOf(selection: BuilderSelection): number | undefined {
  return selection.sighash === unset ? undefined : Number(selection.sighash);
}

function allowedSighashOf(selection: BuilderSelection): number[] | undefined {
  const flag = sighashOf(selection);
  if (flag === undefined || selection.whitelist === 'absent') return undefined;
  return selection.whitelist === 'matching' ? [flag] : [mismatchFlagFor(flag)];
}

function signAtIndexOf(selection: BuilderSelection): number[] | undefined {
  if (selection.signAt === 'all') return undefined;
  return [Number(selection.signAt)];
}

// Every combination RESOLVES on both platforms: neither turns a rejected flag
// into an RPC error. The divergence is in the CONTENT — the extension signs a
// non-whitelisted flag, mobile leaves the input unsigned and swallows the
// throw — so it shows up in the verifier, not in the outcome.
const divergentExpectation: Expectation = { extension: 'success', mobile: 'success' };

// A broadcast is expected to fail (the outpoints are fictitious) and a pinned
// account may not own the input, so those stay unjudged.
function expectationFor(selection: BuilderSelection): Expectation {
  if (selection.broadcast || selection.account !== 'wallet') return 'manual';
  return selection.whitelist === 'mismatched' ? divergentExpectation : 'success';
}

function describe(selection: BuilderSelection): string {
  const set = inputSetOf(selection);
  const count = set.countable ? Number(selection.count) : set.inputs.length;
  const flag = sighashOf(selection);
  const parts = [
    `${count === 1 ? 'One' : count} ${set.label} input${count === 1 ? '' : 's'}`,
    `paying ${outputSets[String(selection.outputs)].label}`,
  ];
  if (flag !== undefined) {
    const whitelist = {
      absent: 'with no `allowedSighash`',
      matching: `whitelisted through \`allowedSighash\``,
      mismatched: `while \`allowedSighash\` names ${SIGHASH_NAMES[mismatchFlagFor(flag)]} instead — deliberately NOT the input's flag`,
    }[String(selection.whitelist)];
    parts.push(`flagged ${SIGHASH_NAMES[flag]} ${whitelist}`);
  }
  if (selection.signAt !== 'all') parts.push(`requesting only input ${selection.signAt}`);
  if (selection.account !== 'wallet') parts.push(`pinned to account ${selection.account}`);
  if (selection.broadcast) parts.push('and asking the wallet to broadcast');
  return `${parts.join(', ')}. Each signature is verified against the digest for the flag it carries${
    flag === undefined
      ? ''
      : ', then the transaction is mutated to prove the flag commits to what it claims'
  }.`;
}

export const psbtBuilder: SpecBuilder = {
  id: 'psbt',
  label: 'signPsbt',
  description:
    'Compose a PSBT from its parts and sign it. Inputs spend fictitious outpoints at your own scripts, so signing succeeds and only a broadcast would fail.',
  category: 'Bitcoin',
  defaults: {
    inputs: 'p2wpkh',
    count: 1,
    sighash: unset,
    whitelist: 'absent',
    outputs: 'self',
    signAt: 'all',
    account: 'wallet',
    broadcast: false,
  },
  fields: [
    {
      key: 'inputs',
      label: 'Inputs',
      options: () => inputSets.map(set => ({ value: set.slug, label: set.label })),
    },
    {
      key: 'count',
      label: 'How many',
      visibleWhen: selection => inputSetOf(selection).countable,
      options: () => [1, 2, 3].map(count => ({ value: count, label: String(count) })),
    },
    {
      key: 'sighash',
      label: 'Sighash flag',
      options: selection =>
        inputSetOf(selection).taproot
          ? sighashOptions
          : sighashOptions.filter(option => option.value !== SIGHASH.DEFAULT),
    },
    {
      key: 'whitelist',
      label: 'allowedSighash',
      visibleWhen: selection => selection.sighash !== unset,
      options: () => [
        { value: 'absent', label: 'not sent' },
        { value: 'matching', label: 'matches the flag' },
        { value: 'mismatched', label: 'names a different flag' },
      ],
    },
    {
      key: 'outputs',
      label: 'Outputs',
      options: () =>
        Object.entries(outputSets).map(([slug, set]) => ({ value: slug, label: set.label })),
    },
    {
      key: 'signAt',
      label: 'signAtIndex',
      visibleWhen: selection => {
        const set = inputSetOf(selection);
        return (set.countable ? Number(selection.count) : set.inputs.length) > 1;
      },
      options: selection => {
        const set = inputSetOf(selection);
        const count = set.countable ? Number(selection.count) : set.inputs.length;
        return [
          { value: 'all', label: 'every input' },
          ...range(count).map(index => ({ value: String(index), label: `input ${index}` })),
        ];
      },
    },
    {
      key: 'account',
      label: 'account',
      options: () => [
        { value: 'wallet', label: 'whatever is selected' },
        { value: '0', label: '0' },
        { value: '1', label: '1' },
      ],
    },
    {
      key: 'broadcast',
      label: 'broadcast',
      options: () => [
        { value: false, label: 'no' },
        { value: true, label: 'yes (expected to fail)' },
      ],
    },
  ],

  build(selection) {
    const set = inputSetOf(selection);
    const count = set.countable ? Number(selection.count) : set.inputs.length;
    const flag = sighashOf(selection);
    const signAtIndex = signAtIndexOf(selection);
    const signable = set.signable(count);
    const expectedSigned = signAtIndex
      ? signAtIndex.filter(index => signable.includes(index))
      : signable;

    return {
      id: builderSpecId(psbtBuilder, selection),
      method: 'signPsbt',
      label: `${set.slug}${count > 1 && set.countable ? ` ×${count}` : ''}${
        flag === undefined ? '' : ` · ${SIGHASH_NAMES[flag]}`
      }${selection.whitelist === 'mismatched' ? ' · mismatched' : ''}`,
      category: 'Bitcoin',
      description: describe(selection),
      async params(ctx) {
        const kinds = set.inputs.map(input => input.kind);
        const keys = await collectPsbtKeys(ctx, kinds, set.vault ? { vault: set.vault } : {});
        const inputs = set.inputs.map(input => ({
          ...input,
          ...(set.countable ? { count } : {}),
          ...(flag === undefined ? {} : { sighash: flag }),
        }));
        const { psbtHex, descriptor } = buildPsbtScenario(
          { inputs, outputs: outputSets[String(selection.outputs)].outputs },
          keys
        );
        const allowedSighash = allowedSighashOf(selection);
        return {
          hex: psbtHex,
          ...(descriptor ? { descriptor } : {}),
          ...(allowedSighash ? { allowedSighash } : {}),
          ...(signAtIndex ? { signAtIndex } : {}),
          ...(selection.account === 'wallet' ? {} : { account: Number(selection.account) }),
          broadcast: Boolean(selection.broadcast),
        } satisfies ParamsOf<'signPsbt'>;
      },
      expect: expectationFor(selection),
      requires: ['singlesig'],
      tags: [
        'psbt',
        ...(set.taproot ? ['taproot'] : []),
        ...(set.needsDescriptor ? ['descriptor'] : []),
        ...(flag === undefined ? [] : ['sighash']),
        ...(selection.whitelist === 'mismatched' ? ['divergent'] : ['ci']),
      ],
      verify: verifySignedPsbt({
        signedIndexes: expectedSigned,
        // A mismatched whitelist is where the platforms differ, so that
        // combination only records what came back.
        ...(selection.whitelist === 'mismatched' || flag === undefined ? {} : { sighash: flag }),
        ...(flag === undefined ? {} : { semantics: true }),
      }),
    } satisfies RpcMethodSpec;
  },

  combinations() {
    const selections: BuilderSelection[] = [];

    // The sighash sweep: every flag × whitelist mode, on each input kind that
    // can carry one. This is what the old sighash matrix covered.
    for (const set of inputSets.filter(candidate => candidate.countable)) {
      const flags = sighashOptions
        .filter(option => option.value !== unset)
        .filter(option => set.taproot || option.value !== SIGHASH.DEFAULT);
      for (const flag of flags) {
        for (const whitelist of ['absent', 'matching', 'mismatched']) {
          selections.push({
            ...psbtBuilder.defaults,
            inputs: set.slug,
            sighash: flag.value,
            whitelist,
            // Two outputs so SINGLE has one at its own index and another to
            // mutate; both mutations then apply to every flag.
            outputs: 'split',
          });
        }
      }
    }

    // The shape sweep: the structural cases a flag does not cover.
    selections.push(
      { ...psbtBuilder.defaults },
      { ...psbtBuilder.defaults, inputs: 'p2tr' },
      { ...psbtBuilder.defaults, inputs: 'mixed' },
      { ...psbtBuilder.defaults, inputs: 'with-foreign' },
      { ...psbtBuilder.defaults, inputs: 'wsh-pk' },
      { ...psbtBuilder.defaults, inputs: 'sortedmulti' },
      { ...psbtBuilder.defaults, count: 2, signAt: '0' },
      { ...psbtBuilder.defaults, outputs: 'op-return' }
    );

    return selections;
  },

  // The first sighash panel shipped ids like `sighash-p2tr-default-mismatched`;
  // they are documented, so they keep resolving.
  parseLegacyId(id) {
    const parts = id.split('-');
    if (parts[0] !== 'sighash' || parts.length < 4) return undefined;
    const whitelist = parts[parts.length - 1];
    if (!['absent', 'matching', 'mismatched'].includes(whitelist)) return undefined;
    const rest = parts.slice(1, -1).join('-');
    const set = inputSets.find(candidate => rest.startsWith(`${candidate.slug}-`));
    if (!set) return undefined;
    const flag = sighashOptions.find(
      option => (option.slug ?? String(option.value)) === rest.slice(set.slug.length + 1)
    );
    if (!flag) return undefined;
    return {
      ...psbtBuilder.defaults,
      inputs: set.slug,
      sighash: flag.value,
      whitelist,
      outputs: 'split',
    };
  },
};
