import { TransactionInput } from '@scure/btc-signer/psbt';
import { bytesToHex } from '@stacks/common';

interface FilterOutIntentionalInscriptionsSpendArgs {
  inputs: TransactionInput[];
  intentionalSpendUtxoIds: string[];
}

export function filterOutIntentionalUtxoSpend({
  inputs,
  intentionalSpendUtxoIds,
}: FilterOutIntentionalInscriptionsSpendArgs): TransactionInput[] {
  return inputs.filter(input => {
    if (!input.txid) throw new Error('Transaction ID is missing in the input');
    const inputTxid = bytesToHex(input.txid);

    return intentionalSpendUtxoIds.every(id => {
      return id !== inputTxid;
    });
  });
}
