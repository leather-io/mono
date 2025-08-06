import { useRef, useState } from 'react';

import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useTokenDetailsFlag } from '@/features/feature-flags';
import { TokenIcon } from '@/features/token/components/token-icon';
import {
  useAssetDescriptionQuery,
  useAssetPriceChangeQuery,
} from '@/queries/assets/fungible-asset-info.query';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { t } from '@lingui/macro';
import { useRouter } from 'expo-router';

import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { ButtonV2, SheetRef } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { SelectedAsset } from '../receive/screens/select-asset';
import { AccountList } from './account-list-item';
import { AccountAddressList } from './address-list';
import { TokenActivity } from './components/token-activity';
import { TokenDetails } from './components/token-details';
import { TokenSheet, TokenSheetData } from './token-sheet';

function AccountDetails({
  accountIndex,
  fingerprint,
  asset,
  availableBalance,
  quoteBalance,
}: TokenProps) {
  const tokenDetailsFlag = useTokenDetailsFlag();

  // const [accountIndex, setAccountIndex] = useState<number | null>(null);
  const tokenSheetRef = useRef<SheetRef>(null);
  const [sheetData, setSheetData] = useState<TokenSheetData | null>(null);

  //  TODO - this shouldn't open a new sheet and should instead just update and filter the content
  // come back to that part
  function onOpenToken(data: TokenSheetData) {
    setSheetData(data);
    // analytics.track('token_sheet_opened', { source: 'action_bar' });
    tokenSheetRef.current?.present();
  }

  return (
    <>
      {accountIndex !== undefined ? (
        <AccountAddressList
          tokenId={asset.symbol}
          accountIndex={accountIndex}
          fingerprint={fingerprint ?? ''}
        />
      ) : (
        <AccountList
          tokenId={asset.symbol}
          selectAccount={
            ({ accountIndex, fingerprint }) =>
              tokenDetailsFlag
                ? onOpenToken({
                    asset,
                    accountIndex,
                    fingerprint,
                    availableBalance,
                    quoteBalance,
                  })
                : undefined
            // setAccountIndex(accountIndex)
          }
        />
      )}
      <TokenSheet data={sheetData} sheetRef={tokenSheetRef} />
    </>
  );
}

interface TokenProps {
  asset: FungibleCryptoAsset;
  receiveAssets?: unknown;
  accountIndex?: number;
  fingerprint?: string;
  availableBalance: Money;
  quoteBalance: Money;
}
export function Token({
  asset,
  receiveAssets,
  accountIndex,
  fingerprint,
  availableBalance,
  quoteBalance,
}: TokenProps) {
  const marketData = useMarketDataQuery(asset);
  const price = marketData.data?.price;
  const { data: assetDescription } = useAssetDescriptionQuery(asset);
  const { data: assetPriceChange } = useAssetPriceChangeQuery(asset);
  const router = useRouter();
  const { sendSheetRef, receiveSheetRef } = useGlobalSheets();

  const account = useAccountByIndex(fingerprint ?? '', accountIndex ?? 0);
  const openSendSheet = () => {
    console.log('------------ account', account, fingerprint, accountIndex, asset.symbol);
    router.setParams({
      accountId: account?.id ?? undefined,
      // tokenId: asset.symbol,
      asset: asset.symbol,
    });
    sendSheetRef.current?.present();
  };

  const openReceiveSheet = () => {
    console.log('------------ account', account, fingerprint, accountIndex, asset.symbol);

    router.setParams({
      accountId: account?.id ?? undefined,
      // asset: asset.symbol,
      asset: receiveAssets,
      pete: 'pete',
    });
    receiveSheetRef.current?.present();
  };
  return (
    <TokenActivity
      ticker={asset.symbol}
      accountIndex={accountIndex}
      fingerprint={fingerprint}
      // TokenDetails is Activity ListHeader to avoid nested scrolling errors
      ListHeader={
        <TokenDetails
          accountDetails={
            <AccountDetails
              accountIndex={accountIndex}
              fingerprint={fingerprint}
              asset={asset}
              availableBalance={availableBalance}
              quoteBalance={quoteBalance}
            />
          }
          actions={
            <>
              <ButtonV2
                onPress={() => openSendSheet()}
                minWidth={86}
                size="sm"
                buttonState="default"
                title={t({
                  id: 'general.send',
                  message: `Send`,
                })}
              />
              {/* 
              For receive, we could not use the sheer as we always need to preselect token 
              It needs to slide in from the right also 
              BUT - at top level we need to add account selection also so need the same logic 

              
               */}
              <ButtonV2
                onPress={() => openReceiveSheet()}
                minWidth={86}
                size="sm"
                buttonState="outline"
                title={t({
                  id: 'general.receive',
                  message: `Receive`,
                })}
              />
            </>
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
  );
}
