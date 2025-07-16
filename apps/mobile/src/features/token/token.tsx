import { useRef, useState } from 'react';

import { TokenIcon } from '@/features/token/components/token-icon';
import {
  useAssetDescriptionQuery,
  useAssetPriceChangeQuery,
} from '@/queries/assets/fungible-asset-info.query';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';
import { Q } from 'vitest/dist/chunks/reporters.nr4dxCkA.js';

import { btcAsset } from '@leather.io/constants';
import { Money } from '@leather.io/models';
import { SheetRef } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { AccountList } from './account-list-item';
import { AccountAddressList } from './address-list';
import { TokenActivity } from './components/token-activity';
import { TokenDetails } from './components/token-details';
import { useGetTokenBalance } from './hooks/use-get-token-balance';
import { TokenSheet, TokenSheetData } from './token-sheet';

interface TokenProps {
  tokenId?: string;
  accountIndex?: number;
  fingerprint?: string;
  availableBalance: Money;
  quoteBalance: Money;
}
export function Token({
  tokenId,
  accountIndex,
  fingerprint,
  availableBalance,
  quoteBalance,
}: TokenProps) {
  const [sheetData, setSheetData] = useState<TokenSheetData | null>(null);
  if (!tokenId) {
    return null;
  }

  console.log('token balance', tokenId, availableBalance, quoteBalance);

  // const tokenBalance = useGetTokenBalance({ tokenId });

  // const balance = tokenBalance;
  // if (!balance) {
  //   return null;
  // }
  // const { asset, availableBalance, quoteBalance } = balance;
  const asset = btcAsset;

  const marketData = useMarketDataQuery(asset);
  const price = marketData.data?.price;

  // FIXME LEA-3015: can't call these conditionally so probably need to refactor this whole thin
  // move the hooks into to their components - accept tokenId as a prop
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
        ticker={tokenId}
        // TokenDetails is Activity ListHeader to avoid nested scrolling errors
        ListHeader={
          <TokenDetails
            accountDetails={
              accountIndex !== undefined ? (
                <AccountAddressList
                  tokenId={tokenId}
                  accountIndex={accountIndex}
                  fingerprint={fingerprint ?? ''}
                />
              ) : (
                <AccountList
                  tokenId={tokenId}
                  selectAccount={account =>
                    onOpenToken({
                      tokenId,
                      accountIndex: account.accountIndex,
                      fingerprint: account.fingerprint,
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
            icon={<TokenIcon ticker={tokenId} asset={asset} />}
            asset={asset}
          />
        }
      />

      <TokenSheet data={sheetData} sheetRef={tokenSheetRef} />
    </>
  );
}
