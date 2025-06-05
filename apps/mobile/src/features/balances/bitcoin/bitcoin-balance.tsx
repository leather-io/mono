import { useBtcAccountBalance, useBtcTotalBalance } from '@/queries/balance/btc-balance.query';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { BtcAvatarIcon, PressableProps } from '@leather.io/ui/native';

import { TokenBalance } from '../token-balance';

interface BitcoinTokenBalanceProps extends PressableProps {
  availableBalance?: Money;
  quoteBalance?: Money;
  onPress?(): void;
  isLoading?: boolean;
}
export function BitcoinTokenBalance({
  availableBalance,
  quoteBalance,
  onPress,
  isLoading,
  ...rest
}: BitcoinTokenBalanceProps) {
  return (
    <TokenBalance
      ticker="BTC"
      icon={<BtcAvatarIcon />}
      tokenName={t({
        id: 'asset_name.bitcoin',
        message: 'Bitcoin',
      })}
      quoteBalance={quoteBalance}
      availableBalance={availableBalance}
      onPress={onPress}
      isLoading={isLoading}
      {...rest}
    />
  );
}

interface BitcoinBalanceProps {
  onPress?(): void;
}

export function BitcoinBalance({ onPress }: BitcoinBalanceProps) {
  const { state, value } = useBtcTotalBalance();

  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;

  return (
    <BitcoinTokenBalance
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      isLoading={state === 'loading'}
      onPress={onPress}
    />
  );
}

interface BitcoinBalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
  onPress?(): void;
}
export function BitcoinBalanceByAccount({
  accountIndex,
  fingerprint,
  onPress,
}: BitcoinBalanceByAccountProps) {
  const { state, value } = useBtcAccountBalance(fingerprint, accountIndex);

  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;

  return (
    <BitcoinTokenBalance
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      onPress={onPress}
      isLoading={state === 'loading'}
    />
  );
}
