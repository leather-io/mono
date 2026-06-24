import BigNumber from 'bignumber.js';
import validate, { AddressInfo, AddressType, getAddressInfo } from 'bitcoin-address-validation';

import { BTC_P2WPKH_DUST_AMOUNT } from '@leather.io/constants';
import { sumNumbers } from '@leather.io/utils';

import { BtcSizeFeeEstimator } from '../fees/btc-size-fee-estimator';
import { inferPaymentTypeFromAddress } from '../utils/bitcoin.utils';
import { createBitcoinAddress } from '../validation/bitcoin-address';
import { CoinSelectionRecipient } from './coin-selection';

export interface InputData {
  value: number;
  txid: string;
  address: string;
}

export function getUtxoTotal<T extends InputData>(utxos: T[]) {
  return sumNumbers(utxos.map(utxo => utxo.value));
}

interface CountInputsByScriptTypeResponse {
  p2wpkh: number;
  p2tr: number;
}
export function countInputsByScriptType<T extends InputData>(
  utxos: T[]
): CountInputsByScriptTypeResponse {
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

export function getSizeInfo<T extends InputData>(payload: {
  utxos: T[];
  recipients: CoinSelectionRecipient[];
  isSendMax?: boolean;
  inputSizing?: InputSizing;
}) {
  const { utxos, recipients, isSendMax, inputSizing } = payload;

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
    const changeType =
      inputSizing?.paymentType === 'p2wsh' ? AddressType.p2wsh : AddressType.p2wpkh;
    outputTypesCount[changeType] = (outputTypesCount[changeType] || 0) + 1;
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
    .filter(utxo => Number(utxo.value) >= BTC_P2WPKH_DUST_AMOUNT)
    .filter(utxo => {
      // Calculate spendableAmount without that utxo
      const { spendableAmount } = getSpendableAmount({
        utxos: utxos.filter(u => u.txid !== utxo.txid),
        feeRate,
        recipients,
        inputSizing,
      });
      // If fullSpendableAmount is greater, do not use utxo
      return spendableAmount.toNumber() < fullSpendableAmount.toNumber();
    });
  return filteredUtxos;
}
