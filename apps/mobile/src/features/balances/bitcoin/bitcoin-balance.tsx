import { useBtcAccountBalance, useBtcTotalBalance } from '@/queries/balance/btc-balance.query';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { BtcAvatarIcon, PressableProps } from '@leather.io/ui/native';

import { TokenBalance } from '../token-balance';

interface BitcoinTokenBalanceProps extends PressableProps {
  availableBalance?: Money;
  fiatBalance?: Money;
  onPress?(): void;
  isLoading?: boolean;
}
export function BitcoinTokenBalance({
  availableBalance,
  fiatBalance,
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
      protocol="nativeBtc"
      fiatBalance={fiatBalance}
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
  const fiatBalance = value?.fiat.availableBalance;

  return (
    <BitcoinTokenBalance
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
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
  const fiatBalance = value?.fiat.availableBalance;

  return (
    <BitcoinTokenBalance
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      onPress={onPress}
      isLoading={state === 'loading'}
    />
  );
}
