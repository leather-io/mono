// pox-5 contract-call payloads.
//
// These mirror the builders apps/web ships in
// `app/features/bitcoin-staking/transactions/` — same function-argument order,
// same epoch-4.0 post-condition types, same post-condition mode. They are
// duplicated here rather than imported so this app stays self-contained; if
// the web builders change, these have to follow, and the unit tests next to
// them are what catches the drift.
//
// The post conditions are the point of the staking tests: epoch 4.0 added
// staking- and pox-post-conditions and an `originator` mode, and a wallet that
// drops or mis-renders one turns a capped stake into an unbounded one.
//
// Pure: no React, no `window`.
import { poxAddressToTuple } from '@stacks/stacking';
import {
  type ClarityValue,
  bufferCV,
  contractPrincipalCV,
  noneCV,
  postConditionToHex,
  principalCV,
  serializeCV,
  serializeCVBytes,
  someCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';

/** Longest lockup pox-5 accepts, in reward cycles. */
export const POX5_MAX_NUM_CYCLES = 96;

const maxSignerCalldataBytes = 500;

/**
 * The contract-call shape every builder returns — structurally the
 * `stx_callContract` params, so it can be sent to the wallet as-is.
 */
export interface Pox5CallContractParams {
  contract: string;
  functionName: string;
  functionArgs: string[];
  network: string;
  postConditions?: string[];
  postConditionMode?: 'allow' | 'deny' | 'originator';
}

export interface ContractIdParts {
  contractAddress: string;
  contractName: string;
}

export function parseContractId(contractId: string): ContractIdParts {
  const [contractAddress, contractName] = contractId.split('.');
  if (!contractAddress || !contractName) {
    throw new Error(`Invalid contract id: ${contractId}`);
  }
  return { contractAddress, contractName };
}

export interface Pox5PayoutPreference {
  btcRewardAddress: string;
  maxFeeSats: bigint;
  minClaimSats?: bigint;
}

/**
 * The signer calldata is a serialized {pox-addr, max-fee} tuple inside an
 * (optional (buff 500)).
 */
export function encodeSignerCalldata(preference: Pox5PayoutPreference | undefined): ClarityValue {
  if (!preference) return noneCV();
  const calldataTuple = tupleCV({
    'pox-addr': poxAddressToTuple(preference.btcRewardAddress),
    'max-fee': uintCV(preference.maxFeeSats),
    ...(preference.minClaimSats !== undefined
      ? { 'min-claim': uintCV(preference.minClaimSats) }
      : {}),
  });
  const bytes = serializeCVBytes(calldataTuple);
  if (bytes.byteLength > maxSignerCalldataBytes) {
    throw new Error(`Signer calldata exceeds the ${maxSignerCalldataBytes}-byte contract limit.`);
  }
  return someCV(bufferCV(bytes));
}

export interface StakeArgs {
  signerManagerContractId: string;
  amountMicroStx: bigint;
  numCycles: number;
  startBurnHeight: number;
  payoutPreference?: Pox5PayoutPreference;
}

export function getStakeOptions(
  args: StakeArgs & { pox5ContractId: string; network: string }
): Pox5CallContractParams {
  const {
    signerManagerContractId,
    amountMicroStx,
    numCycles,
    startBurnHeight,
    payoutPreference,
    pox5ContractId,
    network,
  } = args;

  if (!Number.isInteger(numCycles) || numCycles < 1 || numCycles > POX5_MAX_NUM_CYCLES) {
    throw new Error(`Expected numCycles to be an integer between 1 and ${POX5_MAX_NUM_CYCLES}.`);
  }

  const signerManager = parseContractId(signerManagerContractId);
  const functionArgs: ClarityValue[] = [
    contractPrincipalCV(signerManager.contractAddress, signerManager.contractName),
    uintCV(amountMicroStx),
    uintCV(numCycles),
    uintCV(startBurnHeight),
    encodeSignerCalldata(payoutPreference),
  ];

  return {
    contract: pox5ContractId,
    functionName: 'stake',
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    network,
    // Epoch 4.0 requires the staked amount to be covered by a Staking
    // post-condition under deny mode: exactly amount-ustx staked by the sender.
    postConditions: [
      postConditionToHex({
        type: 'staking-postcondition',
        address: 'origin',
        condition: 'eq',
        amount: amountMicroStx,
      }),
    ],
    postConditionMode: 'deny',
  };
}

export interface StakeUpdateArgs {
  newSignerManagerContractId: string;
  currentSignerManagerContractId: string;
  cyclesToExtend: number;
  amountIncreaseMicroStx: bigint;
  currentAmountMicroStx: bigint;
  payoutPreference?: Pox5PayoutPreference;
}

export function getStakeUpdateOptions(
  args: StakeUpdateArgs & { pox5ContractId: string; network: string }
): Pox5CallContractParams {
  const {
    newSignerManagerContractId,
    currentSignerManagerContractId,
    cyclesToExtend,
    amountIncreaseMicroStx,
    currentAmountMicroStx,
    payoutPreference,
    pox5ContractId,
    network,
  } = args;

  if (
    !Number.isInteger(cyclesToExtend) ||
    cyclesToExtend < 0 ||
    cyclesToExtend > POX5_MAX_NUM_CYCLES
  ) {
    throw new Error(
      `Expected cyclesToExtend to be an integer between 0 and ${POX5_MAX_NUM_CYCLES}.`
    );
  }
  if (amountIncreaseMicroStx < 0n) {
    throw new Error('Expected amountIncreaseMicroStx to be zero or positive.');
  }

  const newSignerManager = parseContractId(newSignerManagerContractId);
  const currentSignerManager = parseContractId(currentSignerManagerContractId);
  const functionArgs: ClarityValue[] = [
    contractPrincipalCV(newSignerManager.contractAddress, newSignerManager.contractName),
    contractPrincipalCV(currentSignerManager.contractAddress, currentSignerManager.contractName),
    uintCV(cyclesToExtend),
    uintCV(amountIncreaseMicroStx),
    encodeSignerCalldata(payoutPreference),
  ];

  return {
    contract: pox5ContractId,
    functionName: 'stake-update',
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    network,
    // With an amount increase the node logs the RESULTING TOTAL (current +
    // increase) as the staked amount, so `eq` checks the total, not the
    // increase. Node builds disagree on what a cycles-only extend logs, so
    // that case uses `lte total` — still capping what may be staked.
    postConditions: [
      postConditionToHex({
        type: 'staking-postcondition',
        address: 'origin',
        condition: amountIncreaseMicroStx > 0n ? 'eq' : 'lte',
        amount: currentAmountMicroStx + amountIncreaseMicroStx,
      }),
    ],
    postConditionMode: 'deny',
  };
}

export interface UnstakeArgs {
  currentSignerManagerContractId: string;
}

export function getUnstakeOptions(
  args: UnstakeArgs & { pox5ContractId: string; network: string }
): Pox5CallContractParams {
  const { currentSignerManagerContractId, pox5ContractId, network } = args;
  const signerManager = parseContractId(currentSignerManagerContractId);
  const functionArgs: ClarityValue[] = [
    contractPrincipalCV(signerManager.contractAddress, signerManager.contractName),
  ];

  return {
    contract: pox5ContractId,
    functionName: 'unstake',
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    network,
    // Epoch 4.0 Pox post-condition (deny mode): unstake is a gated
    // position-altering action the sender expects to perform.
    postConditions: [
      postConditionToHex({
        type: 'pox-postcondition',
        address: 'origin',
        condition: 'will-perform',
      }),
    ],
    postConditionMode: 'deny',
  };
}

export interface ClaimStakerRewardsArgs {
  signerManagerContractId: string;
  stakerAddress: string;
  rewardCycle: number;
}

export function getClaimStakerRewardsOptions(
  args: ClaimStakerRewardsArgs & { network: string }
): Pox5CallContractParams {
  const { signerManagerContractId, stakerAddress, rewardCycle, network } = args;

  if (!Number.isInteger(rewardCycle) || rewardCycle < 0) {
    throw new Error('Expected rewardCycle to be a non-negative integer.');
  }

  const functionArgs: ClarityValue[] = [principalCV(stakerAddress), uintCV(rewardCycle), noneCV()];

  return {
    contract: signerManagerContractId,
    functionName: 'claim-staker-rewards',
    functionArgs: functionArgs.map(arg => serializeCV(arg)),
    network,
    // The sBTC moves FROM the signer-manager TO the sender; the sender moves
    // nothing. Originator mode enforces coverage only for the sender's own
    // assets, so no post conditions are needed while still rejecting any
    // unexpected movement of the sender's funds. An exact FT post-condition is
    // impossible client-side: the claimable amount net of pool fees is only
    // known at execution.
    postConditionMode: 'originator',
  };
}
