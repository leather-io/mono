import { TokenBalance } from '@/features/token/components/token-balance';
import { useBtcAccountBalance, useBtcTotalBalance } from '@/queries/balance/btc-balance.query';
import { t } from '@lingui/macro';

import { btcAsset } from '@leather.io/constants';
import { Money } from '@leather.io/models';
import { BtcAvatarIcon, PressableProps } from '@leather.io/ui/native';

import { OnOpenTokenProps } from '../balances';

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
  onPress?: ({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) => void;
}

export function BitcoinBalance({ onPress }: BitcoinBalanceProps) {
  const { state, value } = useBtcTotalBalance();
  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;
  if (!availableBalance || !quoteBalance) {
    return null;
  }
  return (
    <BitcoinTokenBalance
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      isLoading={state === 'loading'}
      onPress={() => onPress?.({ asset: btcAsset, availableBalance, quoteBalance })}
    />
  );
}

interface BitcoinBalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
  onPress?: ({ asset, availableBalance, quoteBalance }: OnOpenTokenProps) => void;
}
export function BitcoinBalanceByAccount({
  accountIndex,
  fingerprint,
  onPress,
}: BitcoinBalanceByAccountProps) {
  const { state, value } = useBtcAccountBalance(fingerprint, accountIndex);

  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;
  if (!availableBalance || !quoteBalance) {
    return null;
  }
  return (
    <BitcoinTokenBalance
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      onPress={() => onPress?.({ asset: btcAsset, availableBalance, quoteBalance })}
      isLoading={state === 'loading'}
    />
  );
}
