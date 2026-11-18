import { serializeCV, uintCV } from '@stacks/transactions';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { parseContractId } from '~/features/bitcoin-staking/utils/contract-id';
import { getPox5ContractId } from '~/features/bitcoin-staking/utils/pox5-contracts';

const pox5Contract = parseContractId(getPox5ContractId(pox5NetworkConfig.contractNetworkMode));

// One handler serves every signer-manager: the contract is a call argument in
// the request body, not part of the path. Default is above the 50k STX
// signer-set minimum so the pool-health warning stays hidden.
export const pox5GetAmountDelegatedHandler = {
  path: `${pox5NetworkConfig.apiUrl}/v2/contracts/call-read/${pox5Contract.contractAddress}/${pox5Contract.contractName}/get-amount-delegated-for-signer`,
  resp: { okay: true, result: `0x${serializeCV(uintCV(75_000_000_000n))}` },
  method: 'post',
} as const;

// Variant below the signer-set minimum, used by the low-staked override flag.
export const pox5GetAmountDelegatedLowHandler = {
  path: pox5GetAmountDelegatedHandler.path,
  resp: { okay: true, result: `0x${serializeCV(uintCV(10_000_000_000n))}` },
  method: 'post',
} as const;
