import { ClarityType, ClarityValue, hexToCV, principalCV, serializeCV } from '@stacks/transactions';

import { StacksClient } from '@leather.io/query';

import { parseContractId } from '../utils/contract-id';

export interface Pox5StakerInfo {
  amountMicroStx: bigint;
  firstRewardCycle: number;
  numCycles: number;
  // The `signer` principal of get-staker-info. Assumed to be the pool's
  // signer-manager contract principal — the position-to-pool mapping depends on
  // it, and this is the top item to verify on the first pox-5 devnet session.
  signerManagerContractId: string;
}

function parseStakerInfoCV(value: ClarityValue): Pox5StakerInfo | null {
  if (value.type !== ClarityType.OptionalSome) return null;
  const tuple = value.value;
  if (tuple.type !== ClarityType.Tuple) return null;

  const amount = tuple.value['amount-ustx'];
  const firstRewardCycle = tuple.value['first-reward-cycle'];
  const numCycles = tuple.value['num-cycles'];
  const signer = tuple.value['signer'];

  if (!amount || amount.type !== ClarityType.UInt) return null;
  if (!firstRewardCycle || firstRewardCycle.type !== ClarityType.UInt) return null;
  if (!numCycles || numCycles.type !== ClarityType.UInt) return null;
  if (
    !signer ||
    (signer.type !== ClarityType.PrincipalContract && signer.type !== ClarityType.PrincipalStandard)
  ) {
    return null;
  }

  return {
    amountMicroStx: BigInt(amount.value),
    firstRewardCycle: Number(firstRewardCycle.value),
    numCycles: Number(numCycles.value),
    signerManagerContractId: signer.value,
  };
}

interface CreateGetPox5StakerInfoQueryOptionsArgs {
  address: string | undefined;
  pox5ContractId: string;
  client: StacksClient;
}

export function createGetPox5StakerInfoQueryOptions({
  address,
  pox5ContractId,
  client,
}: CreateGetPox5StakerInfoQueryOptionsArgs) {
  return {
    queryKey: ['pox5-staker-info', address, pox5ContractId],
    enabled: !!address,
    refetchInterval: 5000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    async queryFn(): Promise<Pox5StakerInfo | null> {
      if (!address) return null;
      const { contractAddress, contractName } = parseContractId(pox5ContractId);

      const res = await client.callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-staker-info',
        readOnlyFunctionArgs: {
          arguments: [`0x${serializeCV(principalCV(address))}`],
          sender: address,
        },
      });

      if (!res.okay || !res.result) return null;
      return parseStakerInfoCV(hexToCV(res.result));
    },
  };
}
