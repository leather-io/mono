import { ClarityType, hexToCV, principalCV, serializeCV } from '@stacks/transactions';

import { parseContractId } from '../utils/contract-id';
import { payoutPreferenceFunctionNames } from './create-get-pox5-payout-preference-query-options';

export type SignerManagerValidation =
  | { status: 'valid' }
  | { status: 'invalid'; reason: 'not-found' }
  | { status: 'invalid'; reason: 'missing-functions'; missingFunctions: string[] }
  | { status: 'invalid'; reason: 'not-registered' };

const requiredSignerManagerFunctions = [
  { names: ['get-earned-staker-rewards'], access: 'read_only' },
  { names: payoutPreferenceFunctionNames, access: 'read_only' },
  { names: ['claim-staker-rewards'], access: 'public' },
];

const requiredSignerManagerVariable = 'fees-bips';

interface SignerManagerAbi {
  functions: { name: string; access: string }[];
  variables: { name: string }[];
}

interface SignerManagerValidationReader {
  getContractInterface(
    contractAddress: string,
    contractName: string,
    signal?: AbortSignal
  ): Promise<SignerManagerAbi>;
  callReadOnlyFunction(args: {
    contractAddress: string;
    contractName: string;
    functionName: string;
    readOnlyFunctionArgs: { arguments: string[]; sender: string };
    signal?: AbortSignal;
  }): Promise<{ okay: boolean; result?: string; cause?: string }>;
}

function getHttpStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  if ('status' in error && typeof error.status === 'number') return error.status;
  if ('response' in error) {
    const { response } = error;
    if (
      typeof response === 'object' &&
      response !== null &&
      'status' in response &&
      typeof response.status === 'number'
    ) {
      return response.status;
    }
  }
  return undefined;
}

function isNotFoundError(error: unknown): boolean {
  return getHttpStatus(error) === 404;
}

function getMissingFunctions(abi: SignerManagerAbi): string[] {
  const missing = requiredSignerManagerFunctions
    .filter(
      required =>
        !required.names.some(name =>
          abi.functions.some(fn => fn.name === name && fn.access === required.access)
        )
    )
    .map(required => required.names.join(' or '));
  if (!abi.variables.some(variable => variable.name === requiredSignerManagerVariable)) {
    missing.push(requiredSignerManagerVariable);
  }
  return missing;
}

interface CreateGetPox5SignerManagerValidationQueryOptionsArgs {
  contractId: string | undefined;
  pox5ContractId: string;
  client: SignerManagerValidationReader;
}

export function createGetPox5SignerManagerValidationQueryOptions({
  contractId,
  pox5ContractId,
  client,
}: CreateGetPox5SignerManagerValidationQueryOptionsArgs) {
  return {
    queryKey: ['pox5-signer-manager-validation', pox5ContractId, contractId],
    enabled: !!contractId,
    staleTime: 5 * 60_000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    async queryFn({ signal }: { signal: AbortSignal }): Promise<SignerManagerValidation | null> {
      if (!contractId) return null;
      const { contractAddress, contractName } = parseContractId(contractId);

      let abi: SignerManagerAbi;
      try {
        abi = await client.getContractInterface(contractAddress, contractName, signal);
      } catch (error) {
        if (isNotFoundError(error)) return { status: 'invalid', reason: 'not-found' };
        throw error;
      }

      const missingFunctions = getMissingFunctions(abi);
      if (missingFunctions.length > 0) {
        return { status: 'invalid', reason: 'missing-functions', missingFunctions };
      }

      const pox5 = parseContractId(pox5ContractId);
      const res = await client.callReadOnlyFunction({
        contractAddress: pox5.contractAddress,
        contractName: pox5.contractName,
        functionName: 'get-signer-info',
        readOnlyFunctionArgs: {
          arguments: [`0x${serializeCV(principalCV(contractId))}`],
          sender: contractAddress,
        },
        signal,
      });
      if (!res.okay || !res.result) {
        throw new Error(res.cause ?? 'Reading get-signer-info returned no result');
      }
      if (hexToCV(res.result).type !== ClarityType.OptionalSome) {
        return { status: 'invalid', reason: 'not-registered' };
      }

      return { status: 'valid' };
    },
  };
}
