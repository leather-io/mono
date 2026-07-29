import { btcAsset } from '@leather.io/constants';
import type {
  BitcoinTransaction,
  BlockchainActivity,
  MarketData,
  OnChainActivityStatus,
} from '@leather.io/models';
import {
  baseCurrencyAmountInQuoteWithFallback,
  createMoney,
  dateToUnixTimestamp,
} from '@leather.io/utils';

import type { SbtcDeposit, SbtcStatus } from '@app/query/sbtc/sbtc-deposits.query';

function mapDepositStatus(status: SbtcStatus): OnChainActivityStatus {
  switch (status) {
    case 'failed':
    case 'rbf':
      return 'failed';
    case 'confirmed':
      return 'success';
    default:
      return 'pending';
  }
}

export function createSbtcDepositActivity(
  deposit: SbtcDeposit,
  fundingTx: BitcoinTransaction | null,
  marketData?: MarketData
): BlockchainActivity {
  const crypto = createMoney(deposit.amount, 'BTC');
  return {
    timestamp: fundingTx?.time ?? dateToUnixTimestamp(new Date()),
    txid: deposit.bitcoinTxid,
    ...(fundingTx?.height !== undefined ? { blockHeight: fundingTx.height } : {}),
    status: mapDepositStatus(deposit.status),
    chain: 'bitcoin',
    initiatedByUser: false,
    action: 'send',
    balanceChanges: [
      {
        direction: 'sent',
        asset: btcAsset,
        amount: {
          crypto,
          quote: marketData
            ? baseCurrencyAmountInQuoteWithFallback(crypto, marketData)
            : createMoney(0, 'USD'),
        },
      },
    ],
  };
}
