import { AssetAvatar } from '@/components/asset-avatar';
import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { OnPressTokenDetails } from '@/features/token/types';
import { useBtcAccountBalance } from '@/queries/balance/btc-balance.query';
import { t } from '@lingui/core/macro';

import { btcAsset } from '@leather.io/constants';
import { AccountId } from '@leather.io/models';
import { getAssetId, serializeAssetId } from '@leather.io/utils';

type BitcoinTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;

export function BitcoinTokenBalance(props: BitcoinTokenBalanceProps) {
  return (
    <TokenBalance
      ticker="BTC"
      icon={<AssetAvatar asset={btcAsset} />}
      tokenName={t`Bitcoin`}
      {...props}
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
      onPress={
        onPress
          ? () =>
              onPress?.({
                assetId: serializeAssetId(getAssetId(btcAsset)),
              })
          : undefined
      }
      isLoading={state === 'loading'}
    />
  );
}
