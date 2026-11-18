// Chain wiring for the staking payloads: which pox-5 boot contract and which
// pool signer-manager a given network uses, and the default arguments each
// button sends.
//
// The payload shapes themselves come from ./pox5.
//
// Pure: no React, no `window`.
import { Cl, serializeCV } from '@stacks/transactions';

import { readOverride } from '../env';
import type { NetworkMode } from '../types';
import {
  type ClaimStakerRewardsArgs,
  type Pox5CallContractParams,
  type StakeArgs,
  type StakeUpdateArgs,
  type UnstakeArgs,
  getClaimStakerRewardsOptions,
  getStakeOptions,
  getStakeUpdateOptions,
  getUnstakeOptions,
} from './pox5';

export interface StakingChain {
  /** pox-5 boot contract for this chain. */
  pox5ContractId: string;
  /** pox-4 boot contract, for the older delegation calls. */
  pox4ContractId: string;
  /**
   * Signer-manager contract of a pool that exists on this chain. Only the
   * reference deployments are known; override for your own pool.
   */
  signerManagerContractId: string;
}

// Mirrors apps/web's pox5-network-config + stackingContractMap. The devnet and
// testnet signer managers are the reference deployments the web app ships;
// mainnet has no public one, so the mainnet default is a placeholder that
// produces a realistic approval screen and a failing call.
const stakingChains: Record<NetworkMode, StakingChain> = {
  mainnet: {
    pox5ContractId: 'SP000000000000000000002Q6VF78.pox-5',
    pox4ContractId: 'SP000000000000000000002Q6VF78.pox-4',
    signerManagerContractId: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.signer-manager',
  },
  testnet: {
    pox5ContractId: 'ST000000000000000000002AMW42H.pox-5',
    pox4ContractId: 'ST000000000000000000002AMW42H.pox-4',
    signerManagerContractId: 'ST3FJQK31NMDM594YKP1640V5WESX38ENSSY6DMBF.signer-manager',
  },
  regtest: {
    pox5ContractId: 'ST000000000000000000002AMW42H.pox-5',
    pox4ContractId: 'ST000000000000000000002AMW42H.pox-4',
    signerManagerContractId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.signer-manager',
  },
};

export function stakingChainFor(mode: NetworkMode): StakingChain {
  const chain = stakingChains[mode];
  return {
    pox5ContractId: readOverride('POX5_CONTRACT') ?? chain.pox5ContractId,
    pox4ContractId: readOverride('POX4_CONTRACT') ?? chain.pox4ContractId,
    signerManagerContractId:
      readOverride('SIGNER_MANAGER_CONTRACT') ?? chain.signerManagerContractId,
  };
}

export interface StakingContext {
  mode: NetworkMode;
  /** Wallet network id the request is pinned to. */
  network: string;
}

// A burn height far enough ahead to be plausible without a node lookup. The
// contract rejects a start-burn-ht that does not resolve to the next reward
// cycle, so a real stake reads the height first — this is for the approval
// screen, not for a transaction that must confirm.
const placeholderStartBurnHeight = 900_000;

export function stakeParams(
  { mode, network }: StakingContext,
  overrides: Partial<StakeArgs> = {}
): Pox5CallContractParams {
  const chain = stakingChainFor(mode);
  return getStakeOptions({
    signerManagerContractId: chain.signerManagerContractId,
    amountMicroStx: 40_000_000n,
    numCycles: 12,
    startBurnHeight: placeholderStartBurnHeight,
    ...overrides,
    pox5ContractId: chain.pox5ContractId,
    network,
  });
}

export function stakeUpdateParams(
  { mode, network }: StakingContext,
  overrides: Partial<StakeUpdateArgs> = {}
): Pox5CallContractParams {
  const chain = stakingChainFor(mode);
  return getStakeUpdateOptions({
    newSignerManagerContractId: chain.signerManagerContractId,
    currentSignerManagerContractId: chain.signerManagerContractId,
    cyclesToExtend: 0,
    amountIncreaseMicroStx: 0n,
    currentAmountMicroStx: 40_000_000n,
    ...overrides,
    pox5ContractId: chain.pox5ContractId,
    network,
  });
}

export function unstakeParams(
  { mode, network }: StakingContext,
  overrides: Partial<UnstakeArgs> = {}
): Pox5CallContractParams {
  const chain = stakingChainFor(mode);
  return getUnstakeOptions({
    currentSignerManagerContractId: chain.signerManagerContractId,
    ...overrides,
    pox5ContractId: chain.pox5ContractId,
    network,
  });
}

export function claimRewardsParams(
  { mode, network }: StakingContext,
  args: Pick<ClaimStakerRewardsArgs, 'stakerAddress'> & Partial<ClaimStakerRewardsArgs>
): Pox5CallContractParams {
  const chain = stakingChainFor(mode);
  return getClaimStakerRewardsOptions({
    signerManagerContractId: chain.signerManagerContractId,
    rewardCycle: 0,
    ...args,
    network,
  });
}

//
// PoX-4 delegation — the older stacking flow the wallet still has to render.

export function delegateStxParams(
  { mode, network }: StakingContext,
  delegateTo: string,
  amountMicroStx = 40_000_000n
): Pox5CallContractParams {
  return {
    contract: stakingChainFor(mode).pox4ContractId,
    functionName: 'delegate-stx',
    functionArgs: [
      Cl.uint(amountMicroStx),
      Cl.standardPrincipal(delegateTo),
      Cl.none(),
      Cl.none(),
    ].map(argument => serializeCV(argument)),
    network,
    postConditionMode: 'deny',
  };
}

export function revokeDelegateStxParams({ mode, network }: StakingContext): Pox5CallContractParams {
  return {
    contract: stakingChainFor(mode).pox4ContractId,
    functionName: 'revoke-delegate-stx',
    functionArgs: [],
    network,
    postConditionMode: 'deny',
  };
}

export function allowContractCallerParams(
  { mode, network }: StakingContext,
  caller: string
): Pox5CallContractParams {
  const [contractAddress, contractName] = caller.split('.');
  if (!contractAddress || !contractName) throw new Error(`Invalid contract id: ${caller}`);
  return {
    contract: stakingChainFor(mode).pox4ContractId,
    functionName: 'allow-contract-caller',
    functionArgs: [Cl.contractPrincipal(contractAddress, contractName), Cl.none()].map(argument =>
      serializeCV(argument)
    ),
    network,
    postConditionMode: 'deny',
  };
}
