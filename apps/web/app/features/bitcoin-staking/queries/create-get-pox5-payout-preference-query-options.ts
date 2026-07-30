import { StacksNetworkName } from '@stacks/network';
import { hexToCV, principalCV, serializeCV } from '@stacks/transactions';

import { StacksClient } from '@leather.io/query';

import { Pox5PayoutPreference, decodePayoutPreference } from '../transactions/pox5-signer-calldata';
import { parseContractId } from '../utils/contract-id';

interface CreateGetPox5PayoutPreferenceQueryOptionsArgs {
  address: string | undefined;
  signerManagerContractId: string | undefined;
  networkName: StacksNetworkName;
  client: StacksClient;
}

export function createGetPox5PayoutPreferenceQueryOptions({
  address,
  signerManagerContractId,
  networkName,
  client,
}: CreateGetPox5PayoutPreferenceQueryOptionsArgs) {
  return {
    queryKey: ['pox5-payout-preference', address, signerManagerContractId, networkName],
    enabled: !!address && !!signerManagerContractId,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    async queryFn(): Promise<Pox5PayoutPreference | null> {
      if (!address || !signerManagerContractId) return null;
      const { contractAddress, contractName } = parseContractId(signerManagerContractId);

      const res = await client.callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-pox-addr',
        readOnlyFunctionArgs: {
          arguments: [`0x${serializeCV(principalCV(address))}`],
          sender: address,
        },
      });

      if (!res.okay || !res.result) return null;
      return decodePayoutPreference(hexToCV(res.result), networkName);
    },
  };
}
