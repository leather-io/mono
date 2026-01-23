import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { t } from '@lingui/core/macro';

import { AccountId } from '@leather.io/models';
import { BitcoinFilledCircleIcon, BtcAvatarIcon } from '@leather.io/ui/native';

type BitcoinTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;

export function BitcoinTokenBalance(props: BitcoinTokenBalanceProps) {
  return (
    <TokenBalance
      ticker="BTC"
      icon={<BtcAvatarIcon indicator={<BitcoinFilledCircleIcon variant="small" />} />}
      tokenName={t`Bitcoin`}
      {...props}
    />
  );
}

interface BitcoinBalanceByAccountProps extends AccountId {
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

  if (!availableBalance || !quoteBalance) {
    return null;
  }
  return (
    <BitcoinTokenBalance
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      onPress={onPress}
      isLoading={state === 'loading'}
    />
  );
}
