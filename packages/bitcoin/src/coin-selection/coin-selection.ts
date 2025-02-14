import BigNumber from 'bignumber.js';
import { validate } from 'bitcoin-address-validation';

import { BTC_P2WPKH_DUST_AMOUNT } from '@leather.io/constants';
import { BitcoinAddress, Money } from '@leather.io/models';
import { createMoney, sumMoney } from '@leather.io/utils';

import { BitcoinError } from '../validation/bitcoin-error';
import { filterUneconomicalUtxos, getSizeInfo, getUtxoTotal } from './coin-selection.utils';

export interface CoinSelectionOutput {
  value: bigint;
  address?: BitcoinAddress;
}

export interface CoinSelectionUtxo {
  address: BitcoinAddress;
  txid: string;
  value: number;
  vout: number;
}

export interface CoinSelectionRecipient {
  address: BitcoinAddress;
  amount: Money;
}

export interface DetermineUtxosForSpendArgs {
  feeRate: number;
  recipients: CoinSelectionRecipient[];
  utxos: CoinSelectionUtxo[];
}

export function determineUtxosForSpendAll({
  feeRate,
  recipients,
  utxos,
}: DetermineUtxosForSpendArgs) {
  recipients.forEach(recipient => {
    if (!validate(recipient.address)) throw new BitcoinError('InvalidAddress');
  });
  const filteredUtxos = filterUneconomicalUtxos({ utxos, feeRate, recipients });

  const sizeInfo = getSizeInfo({
    inputLength: filteredUtxos.length,
    isSendMax: true,
    recipients,
  });

  // Fee has already been deducted from the amount with send all
  const outputs = recipients.map(({ address, amount }) => ({
    value: BigInt(amount.amount.toNumber()),
    address,
  }));

  const fee = Math.ceil(sizeInfo.txVBytes * feeRate);

  return {
    inputs: filteredUtxos,
    outputs,
    size: sizeInfo.txVBytes,
    fee: createMoney(new BigNumber(fee), 'BTC'),
  };
}

export function determineUtxosForSpend({ feeRate, recipients, utxos }: DetermineUtxosForSpendArgs) {
  recipients.forEach(recipient => {
    if (!validate(recipient.address)) throw new BitcoinError('InvalidAddress');
  });
  const filteredUtxos = filterUneconomicalUtxos({
    utxos: utxos.sort((a, b) => b.value - a.value),
    feeRate,
    recipients,
  });
  if (!filteredUtxos.length) throw new BitcoinError('InsufficientFunds');

  const amount = sumMoney(recipients.map(recipient => recipient.amount));

  // Prepopulate with first utxo, at least one is needed
  const neededUtxos: CoinSelectionUtxo[] = [filteredUtxos[0]];

  function estimateTransactionSize() {
    return getSizeInfo({
      inputLength: neededUtxos.length,
      recipients,
    });
  }

  function hasSufficientUtxosForTx() {
    const txEstimation = estimateTransactionSize();
    const neededAmount = new BigNumber(txEstimation.txVBytes * feeRate).plus(amount.amount);
    return getUtxoTotal(neededUtxos).isGreaterThanOrEqualTo(neededAmount);
  }

  function getRemainingUnspentUtxos() {
    return filteredUtxos.filter(utxo => !neededUtxos.includes(utxo));
  }

  while (!hasSufficientUtxosForTx()) {
    const [nextUtxo] = getRemainingUnspentUtxos();
    // this is the error hit in the form now for insufficient funds
    if (!nextUtxo) throw new BitcoinError('InsufficientFunds');
    neededUtxos.push(nextUtxo);
  }

  const fee = Math.ceil(
    new BigNumber(estimateTransactionSize().txVBytes).multipliedBy(feeRate).toNumber()
  );

  const changeAmount =
    BigInt(getUtxoTotal(neededUtxos).toString()) - BigInt(amount.amount.toNumber()) - BigInt(fee);

  const changeUtxos: CoinSelectionOutput[] =
    changeAmount > BTC_P2WPKH_DUST_AMOUNT
      ? [
          {
            value: changeAmount,
          },
        ]
      : [];

  const outputs: CoinSelectionOutput[] = [
    ...recipients.map(({ address, amount }) => ({
      value: BigInt(amount.amount.toNumber()),
      address,
    })),
    ...changeUtxos,
  ];

  return {
    filteredUtxos,
    inputs: neededUtxos,
    outputs,
    size: estimateTransactionSize().txVBytes,
    fee: createMoney(new BigNumber(fee), 'BTC'),
    ...estimateTransactionSize(),
  };
}
