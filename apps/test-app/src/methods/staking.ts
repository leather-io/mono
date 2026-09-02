// Staking: pox-5 Bitcoin Staking.
//
// The payload comes from `@leather.io/stacks`, the same builders apps/web
// ships, so what the wallet renders here is byte-identical to production. What
// is being tested is mostly the POST CONDITIONS: epoch-4.0 introduced
// staking- and pox-post-conditions and an `originator` mode, and a wallet that
// drops or mis-renders them is the difference between a capped stake and an
// unbounded one.
import { stakeParams } from '../builders/staking';
import { networkModeOf } from '../networks';
import { type ParamsOf, type RpcMethodSpec, networkOf } from '../types';
import { verifyStxTransaction } from '../verifiers/spec-verifiers';

function stakingContext(network: string) {
  return { network, mode: networkModeOf(network) };
}

export const stakingMethods: RpcMethodSpec[] = [
  {
    id: 'pox5-stake',
    method: 'stx_callContract',
    label: 'pox-5 stake',
    category: 'Staking',
    description:
      'Stake 40 STX for 12 cycles. Sent in DENY mode with a staking-post-condition of `eq amount` — epoch 4.0 requires the staked amount to be covered, so the approval screen must render that condition.',
    params(ctx) {
      return stakeParams(stakingContext(networkOf(ctx))) satisfies ParamsOf<'stx_callContract'>;
    },
    expect: 'manual',
    requires: ['devnet'],
    tags: ['staking', 'post-conditions', 'funds'],
    verify: verifyStxTransaction({
      postConditionMode: 'deny',
      postConditionCount: 1,
      functionName: 'stake',
    }),
  },
];
