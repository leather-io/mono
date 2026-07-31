import { serializeCV, someCV, tupleCV, uintCV } from '@stacks/transactions';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { parseContractId } from '~/features/bitcoin-staking/utils/contract-id';
import { getPox5ContractId } from '~/features/bitcoin-staking/utils/pox5-contracts';

import { mockSignerManager } from './pox5-mock-signer-manager';

// A signer-manager that is deliberately NOT in the pool registry, so the byosm
// flow exercises the custom-contract path. Reuses the mock signer-manager's
// address (guaranteed valid for the configured chain) under a different
// contract name, which is what the registry keys on.
export const mockCustomSignerManagerContractId = `${mockSignerManager.contractAddress}.byosm-custom-signer-manager`;

const customSignerManager = parseContractId(mockCustomSignerManagerContractId);
const customBasePath = `${pox5NetworkConfig.apiUrl}/v2/contracts/call-read/${customSignerManager.contractAddress}/${customSignerManager.contractName}`;
const pox5Contract = parseContractId(getPox5ContractId(pox5NetworkConfig.contractNetworkMode));

export const pox5CustomContractInterfaceHandler = {
  path: `${pox5NetworkConfig.apiUrl}/v2/contracts/interface/${customSignerManager.contractAddress}/${customSignerManager.contractName}`,
  resp: {
    functions: [
      { name: 'validate-stake!', access: 'public' },
      { name: 'claim-staker-rewards', access: 'public' },
      { name: 'get-earned-staker-rewards', access: 'read_only' },
      { name: 'get-pox-addr', access: 'read_only' },
    ],
    variables: [{ name: 'fees-bips', access: 'variable' }],
  },
  method: 'get',
} as const;

export const pox5GetSignerInfoHandler = {
  path: `${pox5NetworkConfig.apiUrl}/v2/contracts/call-read/${pox5Contract.contractAddress}/${pox5Contract.contractName}/get-signer-info`,
  resp: { okay: true, result: `0x${serializeCV(someCV(uintCV(1n)))}` },
  method: 'post',
} as const;

const customEarnedRewardsResult = tupleCV({
  earned: uintCV(12_500n),
  fees: uintCV(625n),
});

export const pox5CustomGetEarnedStakerRewardsHandler = {
  path: `${customBasePath}/get-earned-staker-rewards`,
  resp: { okay: true, result: `0x${serializeCV(customEarnedRewardsResult)}` },
  method: 'post',
} as const;

export const pox5CustomGetPoxAddrHandler = {
  path: `${customBasePath}/get-pox-addr`,
  resp: { okay: true, result: '0x09' },
  method: 'post',
} as const;

const customMockFeeBips = 500n;

export const pox5CustomFeesBipsHandler = {
  path: `${pox5NetworkConfig.apiUrl}/v2/data_var/${customSignerManager.contractAddress}/${customSignerManager.contractName}/fees-bips`,
  resp: { data: `0x${serializeCV(uintCV(customMockFeeBips))}` },
  method: 'get',
} as const;
