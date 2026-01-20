import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { t } from '@lingui/core/macro';
import { useRouter } from 'expo-router';

import { btcAsset } from '@leather.io/constants';
import { AccountId } from '@leather.io/models';
import { BitcoinFilledCircleIcon, BtcAvatarIcon } from '@leather.io/ui/native';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

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

export function BitcoinBalanceByAccount({ accountIndex, fingerprint }: AccountId) {
  const { state, value } = useBtcAccountBalance(fingerprint, accountIndex);

  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;
  const router = useRouter();

  if (!availableBalance || !quoteBalance) {
    return null;
  }
  return (
    <BitcoinTokenBalance
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      onPress={() =>
        router.navigate({
          pathname: '/(tabs)/(index)/[assetId]',
          params: { assetId: serializeAssetId(getAssetId(btcAsset)) },
        })
      }
      isLoading={state === 'loading'}
    />
  );
}
