import BigNumber from 'bignumber.js';
import validate, { AddressType, getAddressInfo } from 'bitcoin-address-validation';
import { entries } from 'remeda';

import { BTC_P2TR_DUST_AMOUNT, BTC_P2WPKH_DUST_AMOUNT } from '@leather.io/constants';
import { sumNumbers } from '@leather.io/utils';

import { BtcSizeFeeEstimator } from '../fees/btc-size-fee-estimator';
import { inferPaymentTypeFromAddress } from '../utils/bitcoin.utils';
import { createBitcoinAddress } from '../validation/bitcoin-address';
import type { CoinSelectionRecipient } from './coin-selection';

export interface InputData {
  value: number;
  txid: string;
  address: string;
}

export function getUtxoTotal(utxos: InputData[]) {
  return sumNumbers(utxos.map(utxo => utxo.value));
}

interface CountInputsByScriptTypeResponse {
  p2wpkh: number;
  p2tr: number;
}
export function countInputsByScriptType(utxos: InputData[]): CountInputsByScriptTypeResponse {
  return utxos.reduce(
    (acc, utxo) => {
      const paymentType = inferPaymentTypeFromAddress(createBitcoinAddress(utxo.address));
      return {
        ...acc,
        [paymentType]: acc[paymentType] + 1,
      };
    },
    { p2tr: 0, p2wpkh: 0 }
  );
}

export interface InputSizing {
  paymentType: 'p2wsh';
  threshold: number;
  signerCount: number;
}

export function getSizeInfo(payload: {
  utxos: InputData[];
  recipients: CoinSelectionRecipient[];
  isSendMax?: boolean;
  inputSizing?: InputSizing;
}) {
  const { utxos, recipients, isSendMax, inputSizing } = payload;

  const validAddressesInfo = recipients
    .filter(recipient => validate(recipient.address))
    .map(recipient => getAddressInfo(recipient.address));

  function getTxOutputsLengthByPaymentType() {
    return validAddressesInfo.reduce<Partial<Record<AddressType, number>>>((acc, { type }) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }

  const outputTypesCount = getTxOutputsLengthByPaymentType();

  // Add a change address if not sending max (defaults to p2wpkh)
  if (!isSendMax) {
    const changeType =
      inputSizing?.paymentType === 'p2wsh' ? AddressType.p2wsh : AddressType.p2wpkh;
    outputTypesCount[changeType] = (outputTypesCount[changeType] || 0) + 1;
  }

  // Prepare the output data map for consumption by the txSizer
  const outputsData = entries(outputTypesCount).reduce<Record<string, number>>(
    (acc, [type, count]) => {
      acc[type + '_output_count'] = count;
      return acc;
    },
    {}
  );

  const txSizer = new BtcSizeFeeEstimator();

  if (inputSizing?.paymentType === 'p2wsh') {
    return txSizer.calcTxSize({
      input_script: 'p2wsh',
      input_count: utxos.length,
      input_m: inputSizing.threshold,
      input_n: inputSizing.signerCount,
      ...outputsData,
    });
  }

  const { p2wpkh, p2tr } = countInputsByScriptType(utxos);

  return txSizer.calcMixedInputTxSize({
    p2wpkh_input_count: p2wpkh,
    p2tr_input_count: p2tr,
    ...outputsData,
  });
}

interface GetSpendableAmountArgs<T> {
  utxos: T[];
  feeRate: number;
  recipients: CoinSelectionRecipient[];
  isSendMax?: boolean;
  inputSizing?: InputSizing;
}
export function getSpendableAmount<T extends InputData>({
  utxos,
  feeRate,
  recipients,
  isSendMax,
  inputSizing,
}: GetSpendableAmountArgs<T>) {
  const balance = utxos.map(utxo => utxo.value).reduce((prevVal, curVal) => prevVal + curVal, 0);

  const size = getSizeInfo({
    utxos,
    recipients,
    isSendMax,
    inputSizing,
  });
  const fee = Math.ceil(size.txVBytes * feeRate);
  const bigNumberBalance = BigNumber(balance);
  return {
    spendableAmount: BigNumber.max(0, bigNumberBalance.minus(fee)),
    fee,
  };
}

// Check if the spendable amount drops when adding a utxo
export function getDustThresholdByAddress(address: string): number {
  try {
    const paymentType = inferPaymentTypeFromAddress(createBitcoinAddress(address));
    if (paymentType === 'p2tr') return BTC_P2TR_DUST_AMOUNT;
  } catch {
    // fallback if address parsing fails
  }
  return BTC_P2WPKH_DUST_AMOUNT;
}

export function filterUneconomicalUtxos<T extends InputData>({
  utxos,
  feeRate,
  recipients,
  inputSizing,
}: {
  utxos: T[];
  feeRate: number;
  recipients: CoinSelectionRecipient[];
  inputSizing?: InputSizing;
}) {
  const { spendableAmount: fullSpendableAmount } = getSpendableAmount({
    utxos,
    feeRate,
    recipients,
    inputSizing,
  });

  const filteredUtxos = utxos
    .filter(utxo => Number(utxo.value) >= getDustThresholdByAddress(utxo.address))
    .filter((utxo, index) => {
      // Calculate spendableAmount without that utxo
      const remainingUtxos = utxos.filter((_, i) => i !== index);
      const { spendableAmount } = getSpendableAmount({
        utxos: remainingUtxos,
        feeRate,
        recipients,
        inputSizing,
      });
      // If fullSpendableAmount is greater, do not use utxo
      return spendableAmount.toNumber() < fullSpendableAmount.toNumber();
    });
  return filteredUtxos;
}
