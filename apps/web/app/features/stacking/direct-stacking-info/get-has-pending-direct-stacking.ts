import { StacksNetworkName } from '@stacks/network';
import { poxAddressToBtcAddress } from '@stacks/stacking';
import {
  ContractCallTransaction,
  ContractCallTransactionMetadata,
  MempoolContractCallTransaction,
} from '@stacks/stacks-blockchain-api-types';
import { ClarityType, hexToCV } from '@stacks/transactions';

import { PendingTransactionArgs, getHasPendingTransaction } from './utils-pending-txs';

function isStackCall(
  t: ContractCallTransactionMetadata,

  // Until PoX 3 has been fully activated, using this arg to determine the PoX contract id. Once
  // active, this value can be set to a constant.
  poxContractId: string
) {
  return (
    t.contract_call.function_name === 'stack-stx' && t.contract_call.contract_id === poxContractId
  );
}
export interface ReturnGetHasPendingDirectStacking {
  amountMicroStx: bigint;
  lockPeriod: bigint;
  poxAddress: string;
  transactionId: string;
  startBurnHeight: bigint;
}

// TODO: Types. For now assuming callers only provide a `stack-stx` pox call transaction.
function getDirectStackingStatusFromTransaction(network: StacksNetworkName) {
  return (
    transaction: ContractCallTransaction | MempoolContractCallTransaction
  ): ReturnGetHasPendingDirectStacking => {
    const args = transaction.contract_call.function_args;
    if (!args) {
      // TODO: log error
      throw new Error('Expected `args` to be defined.');
    }
    const [amountMicroStxCV, poxAddressCV, startBurnHeightCV, lockPeriodCV] = args.map(arg =>
      hexToCV(arg.hex)
    );

    // Start burn height
    if (!startBurnHeightCV || startBurnHeightCV.type !== ClarityType.UInt) {
      throw new Error('Expected `startBurnHeightCV` to be of type `UInt`.');
    }
    const startBurnHeight = BigInt(startBurnHeightCV.value);

    // Amount
    if (!amountMicroStxCV || amountMicroStxCV.type !== ClarityType.UInt) {
      throw new Error('Expected `amountMicroStxCV` to be of type `UInt`.');
    }
    const amountMicroStx = BigInt(amountMicroStxCV.value);

    // PoX address
    const poxAddress = poxAddressToBtcAddress(poxAddressCV, network);

    // Lock period
    if (!lockPeriodCV || lockPeriodCV.type !== ClarityType.UInt) {
      throw new Error('Expected `lockPeriodCV` to be of type `UInt`.');
    }
    const lockPeriod = BigInt(lockPeriodCV.value);

    return {
      transactionId: transaction.tx_id,
      startBurnHeight,
      amountMicroStx,
      poxAddress,
      lockPeriod,
    };
  };
}

export async function getHasPendingDirectStacking({
  stackingClient,
  stacksClient,
  address,
  network,
}: PendingTransactionArgs & {
  network: StacksNetworkName;
}): Promise<null | ReturnGetHasPendingDirectStacking> {
  return getHasPendingTransaction({
    stackingClient,
    stacksClient,
    address,
    transactionPredicate: isStackCall,
    transactionConverter: getDirectStackingStatusFromTransaction(network),
  });
}
