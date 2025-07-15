import { TokenIcon } from '@/features/token/components/token-icon';
import {
  useAssetDescriptionQuery,
  useAssetPriceChangeQuery,
} from '@/queries/assets/fungible-asset-info.query';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';

import { createMoney } from '@leather.io/utils';

import { AccountList } from './account-list-item';
import { TokenActivity } from './components/token-activity';
import { TokenDetails } from './components/token-details';
import { useGetTokenBalance } from './hooks/use-get-token-balance';

interface TokenProps {
  tokenId: string;
}
export function Token({ tokenId }: TokenProps) {
  const tokenBalance = useGetTokenBalance(tokenId);
  if (!tokenBalance) {
    return null;
  }
  const { asset, availableBalance, quoteBalance } = tokenBalance;

  const marketData = useMarketDataQuery(asset);
  const price = marketData.data?.price;

  // this should be used to feed the accountDetails component / address for single account
  // const accounts = useAccounts();
  const { data: assetDescription } = useAssetDescriptionQuery(asset);
  const { data: assetPriceChange } = useAssetPriceChangeQuery(asset);

  return (
    <TokenActivity
      ticker={tokenId}
      // TokenDetails passed as ListHeader to avoid nested scrolling errors
      ListHeader={
        <TokenDetails
          // onclick of accountList could just add an account to state?
          // then filter activity further based on that?
          accountDetails={<AccountList tokenId={tokenId} />}
          availableBalance={availableBalance ?? createMoney(0, 'BTC')}
          assetDescription={assetDescription?.description ?? ''}
          price={price ?? createMoney(0, 'USD')}
          changePercent={assetPriceChange?.changePercent ?? 0}
          quoteBalance={quoteBalance ?? createMoney(0, 'USD')}
          icon={<TokenIcon ticker={tokenId} asset={asset} />}
          asset={asset}
        />
      }
    />
  );
}
