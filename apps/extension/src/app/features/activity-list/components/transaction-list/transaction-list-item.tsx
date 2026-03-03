import { BitcoinTransactionItem } from '@app/components/bitcoin-transaction-item/bitcoin-transaction-item';
import { SbtcDepositTransactionItem } from '@app/components/sbtc-deposit-status-item/sbtc-deposit-status-item';

import { StacksTransaction } from './stacks-transaction/stacks-transaction';
import { TransactionListTxs } from './transaction-list.model';

interface TransactionListItemProps {
  tx: TransactionListTxs;
}
export function TransactionListItem({ tx }: TransactionListItemProps) {
  switch (tx.blockchain) {
    case 'bitcoin':
      return <BitcoinTransactionItem transaction={tx.transaction} />;
    case 'stacks':
      return <StacksTransaction transaction={tx.transaction} />;
    case 'bitcoin-stacks':
      return <SbtcDepositTransactionItem deposit={tx.deposit} />;
    default:
      return null;
  }
}
