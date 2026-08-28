// Staking: pox-5 Bitcoin Staking, the older PoX-4 delegation calls, and sBTC
// enrollment.
//
// The payloads come from `@leather.io/stacks`, the same builders apps/web
// ships, so what the wallet renders here is byte-identical to production. What
// is being tested is mostly the POST CONDITIONS: epoch-4.0 introduced
// staking- and pox-post-conditions and an `originator` mode, and a wallet that
// drops or mis-renders them is the difference between a capped stake and an
// unbounded one.
import {
  allowContractCallerParams,
  claimRewardsParams,
  delegateStxParams,
  revokeDelegateStxParams,
  stakeParams,
  stakeUpdateParams,
  stakingChainFor,
  unstakeParams,
} from '../builders/staking';
import { STX_RECIPIENT } from '../constants';
import { networkModeOf } from '../networks';
import { type ParamsOf, type RpcMethodSpec, networkOf } from '../types';
import { verifyStxTransaction } from '../verifiers/spec-verifiers';
import { fetchStxAccount } from '../wallet';

function stakingContext(network: string) {
  return { network, mode: networkModeOf(network) };
}

// sBTC yield enrollment, the one non-pox staking flow in the web app.
const sbtcEnrollContracts: Record<string, string> = {
  mainnet: 'SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.sbtc-yield-enroll',
  testnet: 'ST2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.sbtc-yield-enroll',
  regtest: 'ST2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.sbtc-yield-enroll',
};

export const stakingMethods: RpcMethodSpec[] = [
  // ── pox-5 Bitcoin Staking ─────────────────────────────────────────────────
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
  {
    id: 'pox5-stake-payout-preference',
    method: 'stx_callContract',
    label: 'pox-5 stake (payout preference)',
    category: 'Staking',
    description:
      'The same stake with a BTC payout preference encoded into the signer calldata — an (optional (buff 500)) carrying a pox-addr and a max fee.',
    params(ctx) {
      const network = networkOf(ctx);
      return stakeParams(stakingContext(network), {
        payoutPreference: {
          btcRewardAddress:
            networkModeOf(network) === 'mainnet'
              ? 'bc1qf5akdpz0fcagmfzu9s2yj0xj4yyem23pd9h7cz'
              : 'tb1qf5akdpz0fcagmfzu9s2yj0xj4yyem23p5x5v0y',
          maxFeeSats: 10_000n,
        },
      }) satisfies ParamsOf<'stx_callContract'>;
    },
    expect: 'manual',
    requires: ['devnet'],
    tags: ['staking', 'post-conditions', 'funds'],
    verify: verifyStxTransaction({ postConditionMode: 'deny', functionName: 'stake' }),
  },
  {
    id: 'pox5-stake-update-extend',
    method: 'stx_callContract',
    label: 'pox-5 stake-update (extend)',
    category: 'Staking',
    description:
      'Extend an existing position by 6 cycles without adding STX. The staking post-condition uses `lte total`, because node builds disagree on what a cycles-only extend logs.',
    params(ctx) {
      return stakeUpdateParams(stakingContext(networkOf(ctx)), {
        cyclesToExtend: 6,
      }) satisfies ParamsOf<'stx_callContract'>;
    },
    expect: 'manual',
    requires: ['devnet'],
    tags: ['staking', 'post-conditions', 'funds'],
    verify: verifyStxTransaction({
      postConditionMode: 'deny',
      postConditionCount: 1,
      functionName: 'stake-update',
    }),
  },
  {
    id: 'pox5-stake-update-increase',
    method: 'stx_callContract',
    label: 'pox-5 stake-update (increase)',
    category: 'Staking',
    description:
      'Add 10 STX to an existing 40 STX position. With an increase the node logs the RESULTING TOTAL, so the post-condition is `eq 50 STX` — not `eq 10`.',
    params(ctx) {
      return stakeUpdateParams(stakingContext(networkOf(ctx)), {
        amountIncreaseMicroStx: 10_000_000n,
      }) satisfies ParamsOf<'stx_callContract'>;
    },
    expect: 'manual',
    requires: ['devnet'],
    tags: ['staking', 'post-conditions', 'funds'],
    verify: verifyStxTransaction({ postConditionMode: 'deny', functionName: 'stake-update' }),
  },
  {
    id: 'pox5-unstake',
    method: 'stx_callContract',
    label: 'pox-5 unstake',
    category: 'Staking',
    description:
      'Unstake. Deny mode with a pox-post-condition of `will-perform` — a position-altering action that moves no assets, which is exactly the case a post-condition renderer tends to get wrong.',
    params(ctx) {
      return unstakeParams(stakingContext(networkOf(ctx))) satisfies ParamsOf<'stx_callContract'>;
    },
    expect: 'manual',
    requires: ['devnet'],
    tags: ['staking', 'post-conditions'],
    verify: verifyStxTransaction({
      postConditionMode: 'deny',
      postConditionCount: 1,
      functionName: 'unstake',
    }),
  },
  {
    id: 'pox5-claim-rewards',
    method: 'stx_callContract',
    label: 'pox-5 claim-staker-rewards',
    category: 'Staking',
    description:
      'Claim one cycle of rewards from the pool’s signer-manager. Sent in ORIGINATOR mode with NO post conditions: sBTC moves TO the sender, and the claimable amount net of fees is only known at execution.',
    async params(ctx) {
      const network = networkOf(ctx);
      const { address } = await fetchStxAccount(ctx);
      return claimRewardsParams(stakingContext(network), {
        stakerAddress: address,
      }) satisfies ParamsOf<'stx_callContract'>;
    },
    expect: 'manual',
    requires: ['devnet', 'singlesig'],
    tags: ['staking', 'post-conditions'],
    verify: verifyStxTransaction({
      postConditionMode: 'originator',
      postConditionCount: 0,
      functionName: 'claim-staker-rewards',
    }),
  },

  // ── PoX-4 delegation ──────────────────────────────────────────────────────
  {
    id: 'pox4-delegate-stx',
    method: 'stx_callContract',
    label: 'pox-4 delegate-stx',
    category: 'Staking',
    description:
      'The older pooled-stacking entry point: delegate 40 STX to a pool operator. Still the shape most stacking dApps send.',
    params(ctx) {
      return delegateStxParams(
        stakingContext(networkOf(ctx)),
        STX_RECIPIENT
      ) satisfies ParamsOf<'stx_callContract'>;
    },
    expect: 'manual',
    tags: ['staking', 'legacy'],
    verify: verifyStxTransaction({ functionName: 'delegate-stx' }),
  },
  {
    id: 'pox4-revoke-delegate-stx',
    method: 'stx_callContract',
    label: 'pox-4 revoke-delegate-stx',
    category: 'Staking',
    description: 'Revoke a delegation. No arguments, no assets moved.',
    params(ctx) {
      return revokeDelegateStxParams(
        stakingContext(networkOf(ctx))
      ) satisfies ParamsOf<'stx_callContract'>;
    },
    expect: 'manual',
    tags: ['staking', 'legacy'],
    verify: verifyStxTransaction({ functionName: 'revoke-delegate-stx' }),
  },
  {
    id: 'pox4-allow-contract-caller',
    method: 'stx_callContract',
    label: 'pox-4 allow-contract-caller',
    category: 'Staking',
    description:
      'Authorise a pool contract to act on your PoX position. A permission grant with no visible asset movement — the approval screen has to convey the risk from the function name alone.',
    params(ctx) {
      const network = networkOf(ctx);
      return allowContractCallerParams(
        stakingContext(network),
        stakingChainFor(networkModeOf(network)).signerManagerContractId
      ) satisfies ParamsOf<'stx_callContract'>;
    },
    expect: 'manual',
    tags: ['staking', 'legacy'],
    verify: verifyStxTransaction({ functionName: 'allow-contract-caller' }),
  },

  // ── sBTC ──────────────────────────────────────────────────────────────────
  {
    id: 'sbtc-enroll',
    method: 'stx_callContract',
    label: 'sBTC enroll',
    category: 'Staking',
    description:
      'Enrol in sBTC yield, passing your own principal as the (optional principal) argument — the call apps/web makes from the sBTC page.',
    async params(ctx) {
      const network = networkOf(ctx);
      const { address } = await fetchStxAccount(ctx);
      const { Cl, serializeCV } = await import('@stacks/transactions');
      return {
        contract: sbtcEnrollContracts[networkModeOf(network)],
        functionName: 'enroll',
        functionArgs: [serializeCV(Cl.some(Cl.principal(address)))],
        network,
      } satisfies ParamsOf<'stx_callContract'>;
    },
    expect: 'manual',
    requires: ['singlesig'],
    tags: ['staking'],
    verify: verifyStxTransaction({ functionName: 'enroll' }),
  },
];
