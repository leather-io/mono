import { getAddressInfo, validate } from 'bitcoin-address-validation';

import { BtcSizeFeeEstimator } from '@leather.io/bitcoin';
import type { BitcoinTransactionVectorOutput, BitcoinTx } from '@leather.io/models';
import { satToBtc, sumNumbers, truncateMiddle } from '@leather.io/utils';

export function containsTaprootInput(tx: BitcoinTx) {
  return tx.vin.some(input => input.prevout.scriptpubkey_type === 'v1_p2tr');
}
export function getBitcoinTxSizeEstimation(payload: {
  inputCount: number;
  outputCount: number;
  recipient: string;
}) {
  const { inputCount, recipient, outputCount } = payload;
  const addressInfo = validate(recipient) ? getAddressInfo(recipient) : null;
  const outputAddressTypeWithFallback = addressInfo ? addressInfo.type : 'p2wpkh';

  const txSizer = new BtcSizeFeeEstimator();
  const sizeInfo = txSizer.calcTxSize({
    // Only p2wpkh is supported by the wallet
    input_script: 'p2wpkh',
    input_count: inputCount,
    // From the address of the recipient, we infer the output type
    [outputAddressTypeWithFallback + '_output_count']: outputCount,
  });

  return sizeInfo;
}

export function getRecipientAddressFromOutput(
  vout: BitcoinTransactionVectorOutput[],
  currentBitcoinAddress: string
) {
  return vout.find(output => output.scriptpubkey_address !== currentBitcoinAddress)
    ?.scriptpubkey_address;
}

export function getBitcoinTxCaption(transaction?: BitcoinTx) {
  return transaction ? truncateMiddle(transaction.txid, 4) : '';
}

// If vin array contains a prevout with a scriptpubkey_address equal to
// the address, then that is the current address making a `Sent` tx (-)
// and the value of the prevout is the tx amount
function transactionsSentByAddress(address: string, transaction: BitcoinTx) {
  return transaction.vin.filter(input => input.prevout.scriptpubkey_address === address);
}

// If vout array contains a scriptpubkey_address equal to the address,
// then that is a `Receive` tx (+) and the value is the tx amount
function transactionsReceivedByAddress(address: string, transaction: BitcoinTx) {
  return transaction.vout.filter(output => output.scriptpubkey_address === address);
}

export function isBitcoinTxInbound(address: string, transaction: BitcoinTx) {
  const inputs = transactionsSentByAddress(address, transaction);
  const outputs = transactionsReceivedByAddress(address, transaction);

  if (inputs.length && outputs.length) return false;
  if (inputs.length) return false;
  return true;
}

export function getBitcoinTxValue(address: string, transaction?: BitcoinTx) {
  if (!transaction) return '';
  const inputs = transactionsSentByAddress(address, transaction);
  const outputs = transactionsReceivedByAddress(address, transaction);
  const vinPrevoutValues = inputs.map(vin => vin.prevout.value);
  const voutValues = outputs.map(vout => vout.value);
  const totalInputValue = satToBtc(sumNumbers(vinPrevoutValues));
  const totalOutputValue = satToBtc(sumNumbers(voutValues));

  // This condition handles when change is sent back to the sender address
  const totalInputValueWithSubtractedOutputChange = totalInputValue.minus(totalOutputValue);
  if (inputs.length && outputs.length)
    return '-' + totalInputValueWithSubtractedOutputChange.toString();

  if (inputs.length) return '-' + totalInputValue.toString();
  if (outputs.length) return totalOutputValue.toString();
  return '';
}
