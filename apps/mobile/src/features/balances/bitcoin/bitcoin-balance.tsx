import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { OnPressTokenDetails } from '@/features/token/types';
import { useBtcAccountBalance, useBtcTotalBalance } from '@/queries/balance/btc-balance.query';
import { t } from '@lingui/core/macro';

import { AccountId, CryptoAssetProtocols } from '@leather.io/models';
import { BtcAvatarIcon } from '@leather.io/ui/native';

type BitcoinTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;

export function BitcoinTokenBalance(props: BitcoinTokenBalanceProps) {
  return <TokenBalance ticker="BTC" icon={<BtcAvatarIcon />} tokenName={t`Bitcoin`} {...props} />;
}

export function BitcoinBalance({ onPress }: OnPressTokenDetails) {
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
      onPress={() => onPress?.({ assetProtocol: CryptoAssetProtocols.nativeBtc, tokenId: 'BTC' })}
    />
  );
}

export function BitcoinBalanceByAccount({
  accountIndex,
  fingerprint,
  onPress,
}: OnPressTokenDetails & AccountId) {
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
      onPress={() => onPress?.({ assetProtocol: CryptoAssetProtocols.nativeBtc, tokenId: 'BTC' })}
      isLoading={state === 'loading'}
    />
  );
}
