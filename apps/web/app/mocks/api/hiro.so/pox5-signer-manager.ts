import { serializeCV, tupleCV, uintCV } from '@stacks/transactions';
import { pox5NetworkConfig } from '~/data/pox5-network-config';

import { mockSignerManager } from './pox5-mock-signer-manager';

const signerManagerBasePath = `${pox5NetworkConfig.apiUrl}/v2/contracts/call-read/${mockSignerManager.contractAddress}/${mockSignerManager.contractName}`;

const earnedRewardsResult = tupleCV({
  earned: uintCV(12_500n),
  fees: uintCV(625n),
});

export const pox5GetEarnedStakerRewardsHandler = {
  path: `${signerManagerBasePath}/get-earned-staker-rewards`,
  resp: { okay: true, result: `0x${serializeCV(earnedRewardsResult)}` },
  method: 'post',
} as const;

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
