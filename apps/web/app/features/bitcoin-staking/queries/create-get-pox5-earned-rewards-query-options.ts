import {
  ClarityType,
  ClarityValue,
  hexToCV,
  noneCV,
  principalCV,
  serializeCV,
  uintCV,
} from '@stacks/transactions';
import { isStackingDaoSignerManager } from '~/data/bitcoin-staking-data';

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

function parsePox5EarnedRewardsCV(value: ClarityValue, cycle: number): Pox5EarnedRewards | null {
  if (value.type !== ClarityType.UInt) return null;
  return { cycle, earned: BigInt(value.value), fees: 0n };
}

interface CreateGetPox5EarnedRewardsQueryOptionsArgs {
  address: string | undefined;
  signerManagerContractId: string | undefined;
  cycle: number;
  pox5ContractId: string;
  client: Pick<StacksClient, 'callReadOnlyFunction'>;
}

export function createGetPox5EarnedRewardsQueryOptions({
  address,
  signerManagerContractId,
  cycle,
  pox5ContractId,
  client,
}: CreateGetPox5EarnedRewardsQueryOptionsArgs) {
  return {
    queryKey: ['pox5-earned-rewards', address, pox5ContractId, signerManagerContractId, cycle],
    enabled: !!address && !!signerManagerContractId,
    staleTime: 60_000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    async queryFn(): Promise<Pox5EarnedRewards | null> {
      if (!address || !signerManagerContractId) return null;
      const readsFromPox5 = isStackingDaoSignerManager(signerManagerContractId);
      const { contractAddress, contractName } = parseContractId(
        readsFromPox5 ? pox5ContractId : signerManagerContractId
      );
      const staker = `0x${serializeCV(principalCV(address))}`;
      const rewardCycle = `0x${serializeCV(uintCV(cycle))}`;
      const bondIndex = `0x${serializeCV(noneCV())}`;

      const res = await client.callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-earned-staker-rewards',
        readOnlyFunctionArgs: {
          arguments: readsFromPox5
            ? [
                `0x${serializeCV(principalCV(signerManagerContractId))}`,
                rewardCycle,
                bondIndex,
                staker,
              ]
            : [staker, rewardCycle, bondIndex],
          sender: address,
        },
      });

      if (!res.okay || !res.result) return null;
      const value = hexToCV(res.result);
      return readsFromPox5
        ? parsePox5EarnedRewardsCV(value, cycle)
        : parseEarnedRewardsCV(value, cycle);
    },
  };
}
