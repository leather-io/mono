import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { useBtcAccountBalance, useBtcTotalBalance } from '@/queries/balance/btc-balance.query';
import { t } from '@lingui/core/macro';

import { BtcAvatarIcon } from '@leather.io/ui/native';

import { OnOpenTokenProps } from '../balances';

type BitcoinTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;

export function BitcoinTokenBalance(props: BitcoinTokenBalanceProps) {
  return <TokenBalance ticker="BTC" icon={<BtcAvatarIcon />} tokenName={t`Bitcoin`} {...props} />;
}

interface BitcoinBalanceProps {
  onPress?: ({ tokenId }: OnOpenTokenProps) => void;
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
      onPress={() => onPress?.({ tokenId: 'BTC' })}
    />
  );
}

interface BitcoinBalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
  onPress?: ({ tokenId }: OnOpenTokenProps) => void;
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
      onPress={() => onPress?.({ tokenId: 'BTC' })}
      isLoading={state === 'loading'}
    />
  );
}
