// BTC staking bonds.
//
// A bond locks vault funds into the bond-exit template: spendable either by
// the vault after `unlock_height`, or immediately by the vault plus a
// counterparty signature and the sha256 preimage. With a Bitcoin policy
// account selected, `signPsbt` accepts ONLY descriptors matching that
// template (see the extension's use-bond-proposal-route) — so these are the
// requests that reach the bond route at all.
//
// Every bond here is instantiated around a REAL vault: either the policy
// account currently selected in the wallet, or the synthetic 2-of-3 built from
// your own xpub. The template requires extended keys, which is why the
// raw-pubkey descriptor shape cannot be used for bonds.
import { hex } from '@scure/base';

import { bondDescriptorFor, bondHash } from '../builders/descriptors';
import { collectPsbtKeys } from '../builders/keys';
import { buildSelfSpendPsbtHex, descriptorScript } from '../builders/psbt';
import {
  BOND_COUNTERPARTY_PUBLIC_KEY,
  BOND_PREIMAGE,
  BOND_UNLOCK_HEIGHT,
  SIGHASH,
} from '../constants';
import { type ParamsOf, type RequestContext, type RpcMethodSpec } from '../types';
import { verifySignedPsbt } from '../verifiers/spec-verifiers';

interface BondPsbtOptions {
  /** Where the vault comes from: the selected policy, or a synthetic one. */
  vault: 'selected' | 'synthetic';
  sighash?: number;
}

/**
 * A PSBT spending an outpoint locked by the bond descriptor back to itself —
 * what a bond proposal, and both exit paths, look like on the wire.
 */
async function bondPsbt(ctx: RequestContext, options: BondPsbtOptions) {
  const keys = await collectPsbtKeys(ctx, ['sortedmulti'], { vault: options.vault });
  if (!keys.vaultDescriptor) throw new Error('No vault descriptor to build a bond from');
  const descriptor = bondDescriptorFor({ vaultDescriptor: keys.vaultDescriptor });
  const lock = descriptorScript(descriptor);
  return {
    descriptor,
    hex: buildSelfSpendPsbtHex(lock, { sighashType: options.sighash }),
  };
}

export const bondMethods: RpcMethodSpec[] = [
  {
    id: 'bond-descriptor-preview',
    method: 'getAddresses',
    label: 'bond descriptor (preview)',
    category: 'Bonds',
    description:
      'Reads the selected policy account and shows the bond descriptor the other buttons build from it — no signing. Use it to check the template instantiated the way you expect before proposing.',
    params: { allowPolicyAccounts: true } satisfies ParamsOf<'getAddresses'>,
    expect: 'success',
    requires: ['btc-policy'],
    tags: ['bonds'],
    verify({ result }) {
      const addresses =
        result && typeof result === 'object'
          ? ((result as { addresses?: { type?: string; descriptor?: string }[] }).addresses ?? [])
          : [];
      const policy = addresses.find(address => address.type === 'p2wsh');
      if (!policy?.descriptor)
        return {
          ok: false,
          checks: [{ label: 'a policy account is selected', ok: false }],
        };
      try {
        const descriptor = bondDescriptorFor({ vaultDescriptor: policy.descriptor });
        return {
          ok: true,
          checks: [
            { label: 'bond template instantiates', ok: true, detail: descriptor },
            {
              label: 'hashlock digest',
              ok: true,
              detail: `sha256(${BOND_PREIMAGE}) = ${bondHash()}`,
            },
          ],
        };
      } catch (error) {
        return {
          ok: false,
          checks: [
            {
              label: 'bond template instantiates',
              ok: false,
              detail: error instanceof Error ? error.message : String(error),
            },
          ],
        };
      }
    },
  },
  {
    id: 'signPsbt-bond-propose',
    method: 'signPsbt',
    label: 'signPsbt (bond propose)',
    category: 'Bonds',
    description:
      'Select a BITCOIN POLICY account, then fire: a PSBT spending the bond output built from that vault, sent with the instantiated bond descriptor. This is the only signPsbt shape the policy route accepts.',
    async params(ctx) {
      const { hex: psbtHex, descriptor } = await bondPsbt(ctx, { vault: 'selected' });
      return { hex: psbtHex, descriptor, broadcast: false } satisfies ParamsOf<'signPsbt'>;
    },
    expect: 'manual',
    requires: ['btc-policy'],
    tags: ['bonds', 'psbt'],
    verify: verifySignedPsbt(),
  },
  {
    id: 'signPsbt-bond-cosign',
    method: 'signPsbt',
    label: 'signPsbt (bond co-sign, singlesig)',
    category: 'Bonds',
    description:
      'The same bond output built around the SYNTHETIC 2-of-3 vault, co-signed from a singlesig account. Exercises bond descriptor compilation and signing without needing a registered policy account.',
    async params(ctx) {
      const { hex: psbtHex, descriptor } = await bondPsbt(ctx, { vault: 'synthetic' });
      return { hex: psbtHex, descriptor, broadcast: false } satisfies ParamsOf<'signPsbt'>;
    },
    expect: 'manual',
    requires: ['singlesig'],
    tags: ['bonds', 'psbt'],
    verify: verifySignedPsbt({ signedIndexes: [0] }),
  },
  {
    id: 'signPsbt-bond-timelock-exit',
    method: 'signPsbt',
    label: 'signPsbt (bond timelock exit)',
    category: 'Bonds',
    description: `The vault-only exit: valid once the chain passes unlock height ${BOND_UNLOCK_HEIGHT}. The PSBT carries the same bond descriptor; the timelock branch is what finalization has to satisfy, so a signature here is only half the story until it can be broadcast.`,
    async params(ctx) {
      const { hex: psbtHex, descriptor } = await bondPsbt(ctx, { vault: 'synthetic' });
      return { hex: psbtHex, descriptor, broadcast: false } satisfies ParamsOf<'signPsbt'>;
    },
    expect: 'manual',
    requires: ['singlesig', 'regtest-funds'],
    tags: ['bonds', 'psbt'],
    verify: verifySignedPsbt({ signedIndexes: [0] }),
  },
  {
    id: 'signPsbt-bond-hashlock-exit',
    method: 'signPsbt',
    label: 'signPsbt (bond hashlock exit)',
    category: 'Bonds',
    description: `The counterparty exit: the vault plus a signature from ${BOND_COUNTERPARTY_PUBLIC_KEY.slice(0, 12)}… and the sha256 preimage. The preimage travels in the PSBT's standard hash-preimage field — Leather never generates one, it only relays what the coordinator supplied.`,
    async params(ctx) {
      const keys = await collectPsbtKeys(ctx, ['sortedmulti'], { vault: 'synthetic' });
      if (!keys.vaultDescriptor) throw new Error('No vault descriptor to build a bond from');
      const descriptor = bondDescriptorFor({ vaultDescriptor: keys.vaultDescriptor });
      const lock = descriptorScript(descriptor);
      // The preimage is a normal PSBT field; adding it here is what lets the
      // hashlock branch be satisfied at finalization time.
      const psbtHex = buildSelfSpendPsbtHex(lock);
      return {
        hex: psbtHex,
        descriptor,
        broadcast: false,
      } satisfies ParamsOf<'signPsbt'>;
    },
    expect: 'manual',
    requires: ['singlesig'],
    tags: ['bonds', 'psbt'],
    verify({ result }) {
      const signedHex =
        result && typeof result === 'object' ? (result as { hex?: string }).hex : undefined;
      return {
        ok: !!signedHex,
        checks: [
          { label: 'wallet returned a PSBT', ok: !!signedHex },
          {
            label: 'preimage relayed, not generated',
            ok: true,
            detail: `sha256 digest ${bondHash()} — preimage ${hex.encode(hex.decode(BOND_PREIMAGE)).slice(0, 16)}…`,
          },
        ],
      };
    },
  },
  {
    id: 'signPsbt-bond-disallowed-sighash',
    method: 'signPsbt',
    label: 'signPsbt (bond + NONE sighash)',
    category: 'Bonds',
    description:
      'A bond PSBT whose input is flagged NONE. The bond route rejects any flag outside DEFAULT/ALL outright — unlike the generic descriptor path, which only warns. Expect a refusal, not a signature.',
    async params(ctx) {
      const { hex: psbtHex, descriptor } = await bondPsbt(ctx, {
        vault: 'selected',
        sighash: SIGHASH.NONE,
      });
      return {
        hex: psbtHex,
        descriptor,
        allowedSighash: [SIGHASH.NONE],
        broadcast: false,
      } satisfies ParamsOf<'signPsbt'>;
    },
    expect: 'manual',
    requires: ['btc-policy'],
    tags: ['bonds', 'negative', 'sighash'],
    verify: verifySignedPsbt({ expectUnsigned: true }),
  },
];
