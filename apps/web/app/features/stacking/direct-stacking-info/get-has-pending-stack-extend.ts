import { StacksNetworkName } from '@stacks/network';
import { poxAddressToBtcAddress } from '@stacks/stacking';
import {
  ContractCallTransaction,
  ContractCallTransactionMetadata,
  MempoolContractCallTransaction,
} from '@stacks/stacks-blockchain-api-types';
import { hexToCV } from '@stacks/transactions';

import {
  PendingTransactionArgs,
  expectUintCV,
  getHasPendingTransaction,
} from './utils-pending-txs';

function isStackExtendCall(
  t: ContractCallTransactionMetadata,

  // Until PoX 2 has been fully activated, using this arg to determine the PoX contract id. Once
  // active, this value can be set to a constant.
  poxContractId: string
) {
  return (
    t.contract_call.function_name === 'stack-extend' &&
    t.contract_call.contract_id === poxContractId
  );
}

export interface StackExtendInfo {
  transactionId: string;
  extendCycles: bigint;
  poxAddress: string;
}

// TODO: Types. For now assuming callers only provide a `stack-stx` pox call transaction.
function getStackExtendFromTransaction(network: StacksNetworkName) {
  return (
    transaction: ContractCallTransaction | MempoolContractCallTransaction
  ): StackExtendInfo => {
    const args = transaction.contract_call.function_args;
    if (!args) {
      // TODO: log error
      throw new Error('Expected `args` to be defined.');
    }
    const [extendCyclesCV, poxAddressCV] = args.map(arg => hexToCV(arg.hex));

    const extendCycles = expectUintCV(extendCyclesCV, 'extendCycles');
    const poxAddress = poxAddressToBtcAddress(poxAddressCV, network);

    return {
      transactionId: transaction.tx_id,
      extendCycles,
      poxAddress,
    };
  };
}

export async function getHasPendingStackExtend({
  stackingClient,
  stacksClient,
  address,
  network,
}: PendingTransactionArgs & { network: StacksNetworkName }): Promise<null | StackExtendInfo> {
  return getHasPendingTransaction({
    stackingClient,
    stacksClient,
    address,
    transactionPredicate: isStackExtendCall,
    transactionConverter: getStackExtendFromTransaction(network),
  });
}
