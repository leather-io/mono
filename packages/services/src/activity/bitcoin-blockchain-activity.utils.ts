import BigNumber from 'bignumber.js';

import { btcAsset } from '@leather.io/constants';
import {
  BitcoinTransaction,
  BlockchainActivity,
  BlockchainActivityEvent,
} from '@leather.io/models';
import { createMoney, sumNumbers } from '@leather.io/utils';

import { mapBitcoinTxBlockTime, mapBitcoinTxStatus } from './bitcoin-tx-activity.utils';

export function mapBitcoinTxToActivity(tx: BitcoinTransaction): BlockchainActivity | undefined {
  const isSend = tx.vin.some(input => input.owned);
  const isReceive = tx.vout.some(output => output.owned);
  if (!isSend && !isReceive) return;

  const totalIn = sumNumbers(tx.vin.map(vin => Number(vin.value)));
  const totalOut = sumNumbers(tx.vout.map(vout => Number(vout.value)));

  const commonProps = {
    timestamp: mapBitcoinTxBlockTime(tx),
    txid: tx.txid,
    blockHeight: tx.height,
    fee: createMoney(totalIn.minus(totalOut), 'BTC'),
    status: mapBitcoinTxStatus(tx),
    chain: 'bitcoin' as const,
    initiatedByUser: isSend,
  };

  if (isSend) {
    return { ...commonProps, events: buildSendEvents(tx) };
  }

  return { ...commonProps, events: buildReceiveEvents(tx) };
}

function buildSendEvents(tx: BitcoinTransaction): BlockchainActivityEvent[] {
  const amountsByRecipient = new Map<string, BigNumber>();

  for (const vout of tx.vout) {
    if (!vout.owned && vout.address) {
      const current = amountsByRecipient.get(vout.address) ?? new BigNumber(0);
      amountsByRecipient.set(vout.address, current.plus(vout.value));
    }
  }

  const events: BlockchainActivityEvent[] = [];
  for (const [address, amount] of amountsByRecipient) {
    events.push({
      action: 'sent',
      asset: btcAsset,
      counterparty: address,
      amount: {
        crypto: createMoney(amount, 'BTC'),
        quote: createMoney(0, 'USD'),
      },
    });
  }
  return events;
}

function buildReceiveEvents(tx: BitcoinTransaction): BlockchainActivityEvent[] {
  const ownedOutputAmount = sumNumbers(
    tx.vout.filter(output => output.owned).map(output => Number(output.value))
  );

  const largestNonOwnedInput = tx.vin
    .filter(vin => !vin.owned && vin.address)
    .sort((a, b) => Number(b.value) - Number(a.value))[0];

  return [
    {
      action: 'received',
      asset: btcAsset,
      counterparty: largestNonOwnedInput?.address,
      amount: {
        crypto: createMoney(ownedOutputAmount, 'BTC'),
        quote: createMoney(0, 'USD'),
      },
    },
  ];
}
