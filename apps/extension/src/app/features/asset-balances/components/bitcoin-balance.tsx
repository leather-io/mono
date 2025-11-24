import { BtcAvatarIcon } from '@leather.io/ui';

import { useBtcAccountBalance } from '@app/query/bitcoin/balance/btc-balance.hooks';

import { TokenBalance } from './token-balance';

interface BitcoinBalanceProps {
  accountIndex: number;
  onClick?(): void;
}

export function BitcoinBalance({ accountIndex, onClick }: BitcoinBalanceProps) {
  const balance = useBtcAccountBalance(accountIndex);

  const availableBalance = balance.value?.btc.availableBalance;
  const quoteBalance = balance.value?.quote.availableBalance;

  if (!availableBalance || !quoteBalance) return null;

  return (
    <TokenBalance
      icon={<BtcAvatarIcon />}
      tokenName="Bitcoin"
      ticker="BTC"
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      isLoading={balance.state === 'loading'}
      onClick={onClick}
    />
  );
}
