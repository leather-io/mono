import BigNumber from 'bignumber.js';
import validate, { AddressInfo, AddressType, getAddressInfo } from 'bitcoin-address-validation';

import { BTC_P2WPKH_DUST_AMOUNT } from '@leather.io/constants';
import { sumNumbers } from '@leather.io/utils';

import { BtcSizeFeeEstimator } from '../btc-size-fee-estimator';
import { CoinSelectionRecipient, CoinSelectionUtxo } from './coin-selection';

export function getUtxoTotal(utxos: CoinSelectionUtxo[]) {
  return sumNumbers(utxos.map(utxo => utxo.value));
}

export function getSizeInfo(payload: {
  inputLength: number;
  recipients: CoinSelectionRecipient[];
  isSendMax?: boolean;
}) {
  const { inputLength, recipients, isSendMax } = payload;

  const validAddressesInfo = recipients
    .map(recipient => validate(recipient.address) && getAddressInfo(recipient.address))
    .filter(Boolean) as AddressInfo[];

  function getTxOutputsLengthByPaymentType() {
    return validAddressesInfo.reduce(
      (acc, { type }) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<AddressType, number>
    );
  }

  const outputTypesCount = getTxOutputsLengthByPaymentType();

  // Add a change address if not sending max (defaults to p2wpkh)
  if (!isSendMax) {
    outputTypesCount[AddressType.p2wpkh] = (outputTypesCount[AddressType.p2wpkh] || 0) + 1;
  }

  // Prepare the output data map for consumption by the txSizer
  const outputsData = Object.entries(outputTypesCount).reduce(
    (acc, [type, count]) => {
      acc[type + '_output_count'] = count;
      return acc;
    },
    {} as Record<string, number>
  );

  const txSizer = new BtcSizeFeeEstimator();
  const sizeInfo = txSizer.calcTxSize({
    input_script: 'p2wpkh',
    input_count: inputLength,
    ...outputsData,
  });

  return sizeInfo;
}

export function getSpendableAmount({
  utxos,
  feeRate,
  recipients,
}: {
  utxos: CoinSelectionUtxo[];
  feeRate: number;
  recipients: CoinSelectionRecipient[];
}) {
  const balance = utxos
    .map(utxo => Number(utxo.value))
    .reduce((prevVal, curVal) => prevVal + curVal, 0);

  const size = getSizeInfo({
    inputLength: utxos.length,
    recipients,
  });
  const fee = Math.ceil(size.txVBytes * feeRate);
  const bigNumberBalance = BigNumber(balance);
  return {
    spendableAmount: BigNumber.max(0, bigNumberBalance.minus(fee)),
    fee,
  };
}

// Check if the spendable amount drops when adding a utxo
export function filterUneconomicalUtxos({
  utxos,
  feeRate,
  recipients,
}: {
  utxos: CoinSelectionUtxo[];
  feeRate: number;
  recipients: CoinSelectionRecipient[];
}) {
  const { spendableAmount: fullSpendableAmount } = getSpendableAmount({
    utxos,
    feeRate,
    recipients,
  });

  const filteredUtxos = utxos
    .filter(utxo => utxo.value >= BTC_P2WPKH_DUST_AMOUNT)
    .filter(utxo => {
      // Calculate spendableAmount without that utxo
      const { spendableAmount } = getSpendableAmount({
        utxos: utxos.filter(u => u.txid !== utxo.txid),
        feeRate,
        recipients,
      });
      // If fullSpendableAmount is greater, do not use utxo
      return spendableAmount.toNumber() < fullSpendableAmount.toNumber();
    });
  return filteredUtxos;
}
