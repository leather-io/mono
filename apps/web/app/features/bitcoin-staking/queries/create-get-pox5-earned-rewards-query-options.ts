import {
  ClarityType,
  ClarityValue,
  hexToCV,
  noneCV,
  principalCV,
  serializeCV,
  uintCV,
} from '@stacks/transactions';

import { StacksClient } from '@leather.io/query';

import { parseContractId } from '../utils/contract-id';

// Reward asset amounts as returned by the signer-manager. Kept unit-neutral:
// the sBTC denomination (sats vs micro-units) is unconfirmed in the SIP draft.
export interface Pox5EarnedRewards {
  cycle: number;
  earned: bigint;
  fees: bigint;
}

function parseEarnedRewardsCV(value: ClarityValue, cycle: number): Pox5EarnedRewards | null {
  const tuple = value.type === ClarityType.ResponseOk ? value.value : value;
  if (tuple.type !== ClarityType.Tuple) return null;

  const earned = tuple.value['earned'];
  const fees = tuple.value['fees'];
  if (!earned || earned.type !== ClarityType.UInt) return null;
  if (!fees || fees.type !== ClarityType.UInt) return null;

  return { cycle, earned: BigInt(earned.value), fees: BigInt(fees.value) };
}

interface CreateGetPox5EarnedRewardsQueryOptionsArgs {
  address: string | undefined;
  signerManagerContractId: string | undefined;
  cycle: number;
  client: StacksClient;
}

export function createGetPox5EarnedRewardsQueryOptions({
  address,
  signerManagerContractId,
  cycle,
  client,
}: CreateGetPox5EarnedRewardsQueryOptionsArgs) {
  return {
    queryKey: ['pox5-earned-rewards', address, signerManagerContractId, cycle],
    enabled: !!address && !!signerManagerContractId,
    staleTime: 60_000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    async queryFn(): Promise<Pox5EarnedRewards | null> {
      if (!address || !signerManagerContractId) return null;
      const { contractAddress, contractName } = parseContractId(signerManagerContractId);

      const res = await client.callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-earned-staker-rewards',
        readOnlyFunctionArgs: {
          arguments: [
            `0x${serializeCV(principalCV(address))}`,
            `0x${serializeCV(uintCV(cycle))}`,
            `0x${serializeCV(noneCV())}`,
          ],
          sender: address,
        },
      });

      if (!res.okay || !res.result) return null;
      return parseEarnedRewardsCV(hexToCV(res.result), cycle);
    },
  };
}
