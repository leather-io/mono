import { btcAsset } from '@leather.io/constants';
import type {
  BitcoinTransaction,
  BlockchainActivity,
  BlockchainActivityBalanceChange,
} from '@leather.io/models';
import { createMoney, sumNumbers } from '@leather.io/utils';

function btcBalanceChange(
  direction: BlockchainActivityBalanceChange['direction'],
  amountSats: ReturnType<typeof sumNumbers>
): BlockchainActivityBalanceChange {
  return {
    direction,
    asset: btcAsset,
    amount: { crypto: createMoney(amountSats, 'BTC'), quote: createMoney(0, 'USD') },
  };
}

function largestAddress(
  entries: { readonly owned?: boolean; readonly address?: string; readonly value: string }[]
): string | undefined {
  return entries
    .filter(entry => !entry.owned && entry.address)
    .sort((a, b) => Number(b.value) - Number(a.value))[0]?.address;
}

export function mapBitcoinActivity(tx: BitcoinTransaction): BlockchainActivity | null {
  const isSend = tx.vin.some(input => input.owned);
  const isReceive = tx.vout.some(output => output.owned);
  if (!isSend && !isReceive) return null;

  const base = {
    timestamp: tx.time ?? 0,
    txid: tx.txid,
    blockHeight: tx.height,
    status: tx.height === undefined ? ('pending' as const) : ('success' as const),
    chain: 'bitcoin' as const,
    initiatedByUser: isSend,
  };

  if (isSend) {
    const totalIn = sumNumbers(tx.vin.map(input => Number(input.value)));
    const totalOut = sumNumbers(tx.vout.map(output => Number(output.value)));
    const sent = sumNumbers(
      tx.vout.filter(output => !output.owned).map(output => Number(output.value))
    );
    return {
      ...base,
      action: 'send',
      fee: createMoney(totalIn.minus(totalOut), 'BTC'),
      counterparty: largestAddress(tx.vout),
      balanceChanges: [btcBalanceChange('sent', sent)],
    };
  }

  const received = sumNumbers(
    tx.vout.filter(output => output.owned).map(output => Number(output.value))
  );
  return {
    ...base,
    action: 'receive',
    counterparty: largestAddress(tx.vin),
    balanceChanges: [btcBalanceChange('received', received)],
  };
}
