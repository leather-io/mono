import { StacksNetworkName } from '@stacks/network';
import { hexToCV, principalCV, serializeCV } from '@stacks/transactions';

import { Pox5PayoutPreference, decodePayoutPreference } from '../transactions/pox5-signer-calldata';
import { parseContractId } from '../utils/contract-id';

export const payoutPreferenceFunctionNames = ['get-payout-config', 'get-pox-addr'];
const minClaimFunctionName = 'get-payout-config';

interface Pox5PayoutPreferenceResult {
  preference: Pox5PayoutPreference | null;
  supportsMinClaim: boolean;
}

function isUndefinedFunctionCause(cause: string | undefined): boolean {
  return cause?.includes('UndefinedFunction') ?? false;
}

interface PayoutPreferenceReader {
  callReadOnlyFunction(args: {
    contractAddress: string;
    contractName: string;
    functionName: string;
    readOnlyFunctionArgs: { arguments: string[]; sender: string };
  }): Promise<{ okay: boolean; result?: string; cause?: string }>;
}

interface CreateGetPox5PayoutPreferenceQueryOptionsArgs {
  address: string | undefined;
  signerManagerContractId: string | undefined;
  networkName: StacksNetworkName;
  client: PayoutPreferenceReader;
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
    async queryFn(): Promise<Pox5PayoutPreferenceResult | null> {
      if (!address || !signerManagerContractId) return null;
      const { contractAddress, contractName } = parseContractId(signerManagerContractId);

      for (const functionName of payoutPreferenceFunctionNames) {
        const res = await client.callReadOnlyFunction({
          contractAddress,
          contractName,
          functionName,
          readOnlyFunctionArgs: {
            arguments: [`0x${serializeCV(principalCV(address))}`],
            sender: address,
          },
        });

        if (!res.okay && isUndefinedFunctionCause(res.cause)) continue;
        if (!res.okay || !res.result) {
          throw new Error(res.cause ?? `Reading ${functionName} returned no result`);
        }
        return {
          preference: decodePayoutPreference(hexToCV(res.result), networkName),
          supportsMinClaim: functionName === minClaimFunctionName,
        };
      }

      throw new Error(
        `${signerManagerContractId} exposes none of: ${payoutPreferenceFunctionNames.join(', ')}`
      );
    },
  };
}
