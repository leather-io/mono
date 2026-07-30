import { ClarityType, ClarityValue, hexToCV } from '@stacks/transactions';
import {
  PendingTransactionArgs,
  expectUintCV,
  getHasPendingTransaction,
} from '~/features/stacking/direct-stacking-info/utils-pending-txs';

export type PendingPox5Tx =
  | {
      kind: 'stake';
      txId: string;
      amountMicroStx: bigint;
      numCycles: number;
      signerManagerContractId: string;
    }
  | {
      kind: 'stake-update';
      txId: string;
      cyclesToExtend: number;
      amountIncreaseMicroStx: bigint;
      newSignerManagerContractId: string;
    }
  | { kind: 'unstake'; txId: string };

// Structural supertypes of the blockchain-api transaction types: functions
// accepting them remain assignable to the pending-tx engine's callback types
// while staying constructible in tests.
interface Pox5ContractCallMetadata {
  contract_call: {
    contract_id: string;
    function_name: string;
    function_args?: { hex: string }[];
  };
}

interface Pox5ContractCallFields extends Pox5ContractCallMetadata {
  tx_id: string;
}

const pox5MutationFunctionNames: string[] = ['stake', 'stake-update', 'unstake'];

// getHasPendingTransaction internally resolves the pox-4 contract id (via
// StackingClient.getStackingContract) and passes it to the predicate; the pox-5
// predicate must close over the pox-5 contract id and ignore that argument.
export function isPox5MutationCall(pox5ContractId: string) {
  return (t: Pox5ContractCallMetadata) =>
    t.contract_call.contract_id === pox5ContractId &&
    pox5MutationFunctionNames.includes(t.contract_call.function_name);
}

function expectPrincipalValue(value: ClarityValue | undefined, argName: string): string {
  if (
    !value ||
    (value.type !== ClarityType.PrincipalContract && value.type !== ClarityType.PrincipalStandard)
  ) {
    throw new Error(`Expected '${argName}' to be a principal.`);
  }
  return value.value;
}

export function convertPox5Transaction(transaction: Pox5ContractCallFields): PendingPox5Tx {
  const functionName = transaction.contract_call.function_name;
  const args = (transaction.contract_call.function_args ?? []).map(arg => hexToCV(arg.hex));

  switch (functionName) {
    case 'stake': {
      const [signerManager, amount, numCycles] = args;
      return {
        kind: 'stake',
        txId: transaction.tx_id,
        amountMicroStx: expectUintCV(amount, 'amount-ustx'),
        numCycles: Number(expectUintCV(numCycles, 'num-cycles')),
        signerManagerContractId: expectPrincipalValue(signerManager, 'signer-manager'),
      };
    }
    case 'stake-update': {
      const [newSignerManager, , cyclesToExtend, amountIncrease] = args;
      return {
        kind: 'stake-update',
        txId: transaction.tx_id,
        cyclesToExtend: Number(expectUintCV(cyclesToExtend, 'cycles-to-extend')),
        amountIncreaseMicroStx: expectUintCV(amountIncrease, 'amount-increase'),
        newSignerManagerContractId: expectPrincipalValue(newSignerManager, 'signer-manager'),
      };
    }
    case 'unstake':
      return { kind: 'unstake', txId: transaction.tx_id };
    default:
      throw new Error(`Unexpected pox-5 function name: ${functionName}`);
  }
}

export async function getPendingPox5Transaction(
  args: PendingTransactionArgs & { pox5ContractId: string }
): Promise<PendingPox5Tx | null> {
  const { pox5ContractId, ...pendingArgs } = args;
  return getHasPendingTransaction({
    ...pendingArgs,
    transactionPredicate: isPox5MutationCall(pox5ContractId),
    transactionConverter: convertPox5Transaction,
  });
}
