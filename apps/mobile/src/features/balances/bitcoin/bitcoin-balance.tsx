import { useBtcAccountBalance, useBtcTotalBalance } from '@/queries/balance/btc-balance.query';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { BtcAvatarIcon, PressableProps } from '@leather.io/ui/native';

import { TokenBalance } from '../token-balance';

interface BitcoinTokenBalanceProps extends PressableProps {
  availableBalance: Money;
  fiatBalance: Money;
  onPress?(): void;
}
export function BitcoinTokenBalance({
  availableBalance,
  fiatBalance,
  onPress,
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
    />
  );
}

export function BitcoinBalance() {
  const balance = useBtcTotalBalance();
  // TODO LEA-1726: handle balance loading & error states
  if (balance.state !== 'success') return;
  return (
    <BitcoinTokenBalance
      availableBalance={balance.value.btc.availableBalance}
      fiatBalance={balance.value.fiat.availableBalance}
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
  // TODO LEA-1726: handle balance loading & error states
  if (balance.state !== 'success') return;
  return (
    <BitcoinTokenBalance
      availableBalance={balance.value.btc.availableBalance}
      fiatBalance={balance.value.fiat.availableBalance}
      onPress={onPress}
    />
  );
}
