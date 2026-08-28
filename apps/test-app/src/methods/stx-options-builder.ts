// Stacks transaction options.
//
// The call itself is fixed — a SIP-10 `transfer` with YOUR address as sender,
// because the contract asserts sender = tx-sender. What varies is how the
// transaction is configured: the post-condition MODE, whether a sponsor pays
// the fee, and whether the request pins fee and nonce or leaves them to the
// wallet. Those three are independent, so they are a product.
import { Cl, serializeCV } from '@stacks/transactions';

import { type BuilderSelection, type SpecBuilder, builderSpecId } from '../builders/spec-builder';
import { SIP10_CONTRACT, STX_RECIPIENT } from '../constants';
import { type ParamsOf, type RpcMethodSpec, networkOf } from '../types';
import { verifyStxTransaction } from '../verifiers/spec-verifiers';
import { fetchStxAccount } from '../wallet';

const walletChosen = 'wallet';

// Pinned values, so a spec can assert the wallet used exactly what was asked
// rather than its own estimate.
const explicitFee = 1234;
const explicitNonce = 7;

type PostConditionMode = 'allow' | 'deny' | 'originator';

function modeOf(selection: BuilderSelection): PostConditionMode | undefined {
  return selection.mode === walletChosen ? undefined : (selection.mode as PostConditionMode);
}

function describe(selection: BuilderSelection): string {
  const mode = modeOf(selection);
  const parts = [
    `Calls \`transfer\` on the SIP-10 contract behind SIP10_ASSET with your address as sender`,
  ];
  parts.push(
    mode === undefined
      ? 'leaving the post-condition mode to the wallet'
      : `in ${mode.toUpperCase()} mode`
  );
  if (mode === 'allow')
    parts.push(
      'so nothing constrains what the contract may move — the approval screen has to say so'
    );
  if (mode === 'originator') parts.push("so only the sender's own assets are covered");
  if (selection.sponsored) parts.push('as a sponsored transaction — someone else pays the fee');
  if (selection.feeNonce === 'explicit')
    parts.push(`with fee ${explicitFee} and nonce ${explicitNonce} pinned by the request`);
  return `${parts.join(', ')}.`;
}

export const stxOptionsBuilder: SpecBuilder = {
  id: 'stx-options',
  label: 'stx_callContract options',
  description:
    'The same SIP-10 transfer call, configured different ways. Post conditions and their mode are what the approval screen has to render correctly.',
  category: 'Stacks',
  defaults: { mode: walletChosen, sponsored: false, feeNonce: walletChosen },
  fields: [
    {
      key: 'mode',
      label: 'postConditionMode',
      options: () => [
        { value: walletChosen, label: 'not sent' },
        { value: 'deny', label: 'deny' },
        { value: 'allow', label: 'allow' },
        { value: 'originator', label: 'originator' },
      ],
    },
    {
      key: 'sponsored',
      label: 'sponsored',
      options: () => [
        { value: false, label: 'no' },
        { value: true, label: 'yes' },
      ],
    },
    {
      key: 'feeNonce',
      label: 'fee + nonce',
      options: () => [
        { value: walletChosen, label: 'wallet decides' },
        { value: 'explicit', label: `pinned (${explicitFee} / ${explicitNonce})` },
      ],
    },
  ],

  build(selection) {
    const mode = modeOf(selection);
    return {
      id: builderSpecId(stxOptionsBuilder, selection),
      method: 'stx_callContract',
      label: `stx_callContract · ${mode ?? 'default'}${selection.sponsored ? ' · sponsored' : ''}${
        selection.feeNonce === 'explicit' ? ' · pinned fee' : ''
      }`,
      category: 'Stacks',
      description: describe(selection),
      async params(ctx) {
        const { address } = await fetchStxAccount(ctx);
        return {
          contract: SIP10_CONTRACT,
          functionName: 'transfer',
          functionArgs: [
            Cl.uint(1_000_000),
            Cl.standardPrincipal(address),
            Cl.standardPrincipal(STX_RECIPIENT),
            Cl.none(),
          ].map(argument => serializeCV(argument)),
          network: networkOf(ctx),
          ...(mode ? { postConditionMode: mode } : {}),
          ...(selection.sponsored ? { sponsored: true } : {}),
          ...(selection.feeNonce === 'explicit' ? { fee: explicitFee, nonce: explicitNonce } : {}),
        } satisfies ParamsOf<'stx_callContract'>;
      },
      // Whether the call succeeds depends on the wallet's balance and the
      // token it holds, so the outcome is never asserted — the checks are.
      expect: 'manual',
      requires: ['singlesig'],
      tags: ['post-conditions', ...(selection.sponsored ? ['sponsored'] : [])],
      verify: verifyStxTransaction({
        contract: SIP10_CONTRACT,
        functionName: 'transfer',
        ...(mode ? { postConditionMode: mode } : {}),
      }),
    } satisfies RpcMethodSpec;
  },

  combinations() {
    const modes = [walletChosen, 'deny', 'allow', 'originator'];
    return [
      ...modes.map(mode => ({ ...stxOptionsBuilder.defaults, mode })),
      { ...stxOptionsBuilder.defaults, mode: 'deny', sponsored: true },
      { ...stxOptionsBuilder.defaults, mode: 'deny', feeNonce: 'explicit' },
    ];
  },
};
