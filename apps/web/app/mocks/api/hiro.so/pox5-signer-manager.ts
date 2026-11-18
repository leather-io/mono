import { serializeCV, tupleCV, uintCV } from '@stacks/transactions';
import { isStackingDaoSignerManager } from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { parseContractId } from '~/features/bitcoin-staking/utils/contract-id';
import { getPox5ContractId } from '~/features/bitcoin-staking/utils/pox5-contracts';

import { mockSignerManager } from './pox5-mock-signer-manager';

const signerManagerBasePath = `${pox5NetworkConfig.apiUrl}/v2/contracts/call-read/${mockSignerManager.contractAddress}/${mockSignerManager.contractName}`;
const pox5Contract = parseContractId(getPox5ContractId(pox5NetworkConfig.contractNetworkMode));
const pox5BasePath = `${pox5NetworkConfig.apiUrl}/v2/contracts/call-read/${pox5Contract.contractAddress}/${pox5Contract.contractName}`;

const earnedRewardsResult = tupleCV({
  earned: uintCV(12_500n),
  fees: uintCV(625n),
});

const signerManagerEarnedStakerRewardsHandler = {
  path: `${signerManagerBasePath}/get-earned-staker-rewards`,
  resp: { okay: true, result: `0x${serializeCV(earnedRewardsResult)}` },
  method: 'post',
} as const;

const pox5EarnedStakerRewardsHandler = {
  path: `${pox5BasePath}/get-earned-staker-rewards`,
  resp: { okay: true, result: `0x${serializeCV(uintCV(12_500n))}` },
  method: 'post',
} as const;

export const pox5GetEarnedStakerRewardsHandler = isStackingDaoSignerManager(
  `${mockSignerManager.contractAddress}.${mockSignerManager.contractName}`
)
  ? pox5EarnedStakerRewardsHandler
  : signerManagerEarnedStakerRewardsHandler;

// Default: no L1 payout preference registered; rewards accrue as sBTC.
export const pox5GetPoxAddrHandler = {
  path: `${signerManagerBasePath}/get-pox-addr`,
  resp: { okay: true, result: '0x09' },
  method: 'post',
} as const;

const mockFeeBips = 500n;

export const pox5FeesBipsHandler = {
  path: `${pox5NetworkConfig.apiUrl}/v2/data_var/${mockSignerManager.contractAddress}/${mockSignerManager.contractName}/fees-bips`,
  resp: { data: `0x${serializeCV(uintCV(mockFeeBips))}` },
  method: 'get',
} as const;
