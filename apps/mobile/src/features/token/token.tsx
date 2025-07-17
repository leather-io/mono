import { useRef, useState } from 'react';

import { TokenIcon } from '@/features/token/components/token-icon';
import {
  useAssetDescriptionQuery,
  useAssetPriceChangeQuery,
} from '@/queries/assets/fungible-asset-info.query';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';

import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { AccountList } from './account-list-item';
import { AccountAddressList } from './address-list';
import { TokenActivity } from './components/token-activity';
import { TokenDetails } from './components/token-details';
import { TokenSheet, TokenSheetData } from './token-sheet';

interface TokenProps {
  asset: FungibleCryptoAsset;
  accountIndex?: number;
  fingerprint?: string;
  availableBalance: Money;
  quoteBalance: Money;
}
export function Token({
  asset,
  accountIndex,
  fingerprint,
  availableBalance,
  quoteBalance,
}: TokenProps) {
  const [sheetData, setSheetData] = useState<TokenSheetData | null>(null);

  const marketData = useMarketDataQuery(asset);
  const price = marketData.data?.price;
  const { data: assetDescription } = useAssetDescriptionQuery(asset);
  const { data: assetPriceChange } = useAssetPriceChangeQuery(asset);
  const tokenSheetRef = useRef<SheetRef>(null);

  function onOpenToken(data: TokenSheetData) {
    setSheetData(data);
    // analytics.track('token_sheet_opened', { source: 'action_bar' });
    tokenSheetRef.current?.present();
  }

  return (
    <>
      <TokenActivity
        ticker={asset.symbol}
        accountIndex={accountIndex}
        fingerprint={fingerprint}
        // TokenDetails is Activity ListHeader to avoid nested scrolling errors
        ListHeader={
          <TokenDetails
            accountDetails={
              accountIndex !== undefined ? (
                <AccountAddressList
                  tokenId={asset.symbol}
                  accountIndex={accountIndex}
                  fingerprint={fingerprint ?? ''}
                />
              ) : (
                <AccountList
                  tokenId={asset.symbol}
                  selectAccount={({ accountIndex, fingerprint }) =>
                    onOpenToken({
                      asset,
                      accountIndex,
                      fingerprint,
                      availableBalance,
                      quoteBalance,
                    })
                  }
                />
              )
            }
            availableBalance={availableBalance ?? createMoney(0, 'BTC')}
            assetDescription={assetDescription?.description ?? ''}
            price={price ?? createMoney(0, 'USD')}
            changePercent={assetPriceChange?.changePercent ?? 0}
            quoteBalance={quoteBalance ?? createMoney(0, 'USD')}
            icon={<TokenIcon ticker={asset.symbol} asset={asset} />}
            asset={asset}
          />
        }
      />

      <TokenSheet data={sheetData} sheetRef={tokenSheetRef} />
    </>
  );
}
