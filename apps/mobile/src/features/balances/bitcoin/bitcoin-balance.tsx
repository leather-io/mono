import { useBtcAccountBalance, useBtcTotalBalance } from '@/queries/balance/btc-balance.query';
import { t } from '@lingui/macro';

import { BtcAvatarIcon, PressableProps } from '@leather.io/ui/native';

import {
  EmptyBalance,
  TokenBalance,
  type TokenBalance as TokenBalanceType,
} from '../token-balance';

interface BitcoinTokenBalanceProps extends PressableProps {
  availableBalance: TokenBalanceType;
  fiatBalance: TokenBalanceType;
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
  const balance = useBtcTotalBalance();

  const availableBalance =
    balance.state === 'success' ? balance.value.btc.availableBalance : EmptyBalance;
  const fiatBalance =
    balance.state === 'success' ? balance.value.fiat.availableBalance : EmptyBalance;

  return (
    <BitcoinTokenBalance
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      isLoading={balance.state === 'loading'}
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
  const balance = useBtcAccountBalance(fingerprint, accountIndex);

  const availableBalance =
    balance.state === 'success' ? balance.value.btc.availableBalance : EmptyBalance;
  const fiatBalance =
    balance.state === 'success' ? balance.value.fiat.availableBalance : EmptyBalance;

  return (
    <BitcoinTokenBalance
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      onPress={onPress}
      isLoading={balance.state === 'loading'}
    />
  );
}
