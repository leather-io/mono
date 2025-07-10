import React from 'react';

import { useAssetDescriptionQuery } from '@/queries/assets/fungible-asset-info.query';
import { useAssetPriceChangeQuery } from '@/queries/assets/fungible-asset-info.query';
import { useBtcTotalBalance } from '@/queries/balance/btc-balance.query';
import { useBtcMarketDataQuery } from '@/queries/market-data/btc-market-data.query';

import { FungibleCryptoAsset } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { AccountList } from './account-list-item';
import { TokenActivity } from './components/token-activity';
import { TokenDetails } from './components/token-details';

interface TokenProps {
  tokenId: string;
  asset: FungibleCryptoAsset;
}
// PETE - smart to have a switch here and then seperate files for BTC / STX / Sip10  - same as balances
// Do that in TokenScreen and have BTCToken / STXToken / Sip10Token files that pass on info to this component

export function Token({ tokenId, asset }: TokenProps) {
  // const { totalBalance } = useTotalBalance();
  const { value } = useBtcTotalBalance();

  const { data: btcMarketData } = useBtcMarketDataQuery();

  // this should be used to feed the accountDetails component / address for single account
  // const accounts = useAccounts();
  const { data: assetDescription } = useAssetDescriptionQuery(asset);
  const { data: assetPriceChange } = useAssetPriceChangeQuery(asset);

  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;

  // Need to use these for Balance Loaders. Probably better to pass <Balance /> to TokenDetails instead with a loader included
  // need to have the error overlay in TokenDetails also for failed queries
  // const isLoadingTotalBalance = value?.btc.state === 'loading';
  // const isErrorTotalBalance = value?.btc.state === 'error';

  return (
    <TokenActivity
      ticker={tokenId}
      // TokenDetails passed as ListHeader to avoid nested scrolling errors
      ListHeader={
        <TokenDetails
          accountDetails={<AccountList />}
          availableBalance={availableBalance ?? createMoney(0, 'BTC')}
          assetDescription={assetDescription?.description ?? 'No description available'}
          price={btcMarketData?.price ?? createMoney(0, 'USD')}
          changePercent={assetPriceChange?.changePercent ?? 0}
          quoteBalance={quoteBalance ?? createMoney(0, 'USD')}
          ticker={tokenId}
          asset={asset}
        />
      }
    />
  );
}
