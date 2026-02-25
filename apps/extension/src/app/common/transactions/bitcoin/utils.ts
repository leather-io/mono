import type { BitcoinTx } from '@leather.io/models';
import { satToBtc, sumNumbers, truncateMiddle } from '@leather.io/utils';

export function getBitcoinTxCaption(transaction?: BitcoinTx) {
  return transaction ? truncateMiddle(transaction.txid, 4) : '';
}

type IsCorrespondingAddressFn = (address: string) => boolean;

// If vin array contains a prevout with a scriptpubkey_address equal to
// the address, then that is the current address making a `Sent` tx (-)
// and the value of the prevout is the tx amount
function transactionsSentByAddress(
  isCorrespondingAddressFn: IsCorrespondingAddressFn,
  transaction: BitcoinTx
) {
  return transaction.vin.filter(input =>
    isCorrespondingAddressFn(input.prevout.scriptpubkey_address)
  );
}

// If vout array contains a scriptpubkey_address equal to the address,
// then that is a `Receive` tx (+) and the value is the tx amount
function transactionsReceivedByAddress(
  isCorrespondingAddressFn: IsCorrespondingAddressFn,
  transaction: BitcoinTx
) {
  return transaction.vout.filter(output => isCorrespondingAddressFn(output.scriptpubkey_address));
}

export function isBitcoinTxInbound(
  isCorrespondingAddressFn: IsCorrespondingAddressFn,
  transaction: BitcoinTx
) {
  const inputs = transactionsSentByAddress(isCorrespondingAddressFn, transaction);
  const outputs = transactionsReceivedByAddress(isCorrespondingAddressFn, transaction);

  if (inputs.length && outputs.length) return false;
  if (inputs.length) return false;
  return true;
}

export function getBitcoinTxValue(
  isCorrespondingAddressFn: IsCorrespondingAddressFn,
  transaction?: BitcoinTx
) {
  if (!transaction) return '';
  const inputs = transactionsSentByAddress(isCorrespondingAddressFn, transaction);
  const outputs = transactionsReceivedByAddress(isCorrespondingAddressFn, transaction);
  const vinPrevoutValues = inputs.map(vin => vin.prevout.value);
  const voutValues = outputs.map(vout => vout.value);
  const totalInputValue = satToBtc(sumNumbers(vinPrevoutValues));
  const totalOutputValue = satToBtc(sumNumbers(voutValues));

  // This condition handles when change is sent back to the sender address
  const totalReceived = totalOutputValue.minus(totalInputValue);
  return totalReceived.toString();
}
