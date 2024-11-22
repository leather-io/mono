import {
  useBitcoinAccountTotalBitcoinBalance,
  useWalletTotalBitcoinBalance,
} from '@/queries/balance/bitcoin-balance.query';
import { t } from '@lingui/macro';

import { Money } from '@leather.io/models';
import { BtcAvatarIcon } from '@leather.io/ui/native';

import { TokenBalance } from '../token-balance';

interface BitcoinTokenBalanceProps {
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
  const { availableBalance, fiatBalance } = useWalletTotalBitcoinBalance();
  return <BitcoinTokenBalance availableBalance={availableBalance} fiatBalance={fiatBalance} />;
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
  const { availableBalance, fiatBalance } = useBitcoinAccountTotalBitcoinBalance({
    accountIndex,
    fingerprint,
  });
  // entering an account this runs 3 times, sometimes 4 times!
  // first time is the wallet balance?????
  // second time is the account balance
  // third time is the account balance with the available balance
  console.log('BitcoinBalanceByAccount', fingerprint, accountIndex, availableBalance, fiatBalance);
  return (
    <BitcoinTokenBalance
      availableBalance={availableBalance}
      fiatBalance={fiatBalance}
      onPress={onPress}
    />
  );
}
