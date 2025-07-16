import { useRef, useState } from 'react';

import { TokenIcon } from '@/features/token/components/token-icon';
import {
  useAssetDescriptionQuery,
  useAssetPriceChangeQuery,
} from '@/queries/assets/fungible-asset-info.query';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';
import { Account } from '@/store/accounts/accounts';

import { SheetRef, Text } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { AccountList } from './account-list-item';
import { AccountAddressList } from './address-list';
import { TokenActivity } from './components/token-activity';
import { TokenDetails } from './components/token-details';
import { useGetAccountTokenBalance, useGetTokenBalance } from './hooks/use-get-token-balance';
import { TokenSheet, TokenSheetData } from './token-sheet';

interface TokenProps {
  tokenId?: string;
  accountIndex?: number;
  fingerprint?: string;
}
export function Token({ tokenId, accountIndex, fingerprint }: TokenProps) {
  const [sheetData, setSheetData] = useState<TokenSheetData | null>(null);
  if (!tokenId) {
    return null;
  }

  console.log('accountIndex', accountIndex);
  console.log('fingerprint', fingerprint);
  // const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  // const [selectedToken, setSelectedToken] = useState<string | null>(tokenId);
  // const tokenTicker = tokenId ? tokenId : 'STX';
  const tokenBalance = useGetTokenBalance({ tokenId });

  // const accounts = useAccounts();
  // const accounts = useAccounts();
  // this causes a crash when selectedAccount is set
  // const accountTokenBalance = useGetAccountTokenBalance({
  //   tokenId,
  //   account: selectedAccount!,
  // });

  const balance = tokenBalance;
  if (!balance) {
    return null;
  }
  const { asset, availableBalance, quoteBalance } = balance;

  const marketData = useMarketDataQuery(asset);
  const price = marketData.data?.price;

  // this should be used to feed the accountDetails component / address for single account
  // const accounts = useAccounts();

  // TODO - can't call these conditionally so probably need to refactor this whole thin
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
        // TokenDetails passed as ListHeader to avoid nested scrolling errors
        ListHeader={
          <TokenDetails
            // onclick of accountList could just add an account to state?
            // then filter activity further based on that?
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
                    })
                  }
                  // accountId =>
                  // setSelectedAccount(
                  //   accounts.list.find(account => account.id === accountId) ?? null
                  // )
                  // (accountId: string) => console.log('accountId', accountId)
                  // (account: Account) => {
                  //   // const account = accounts.list.find(account => account.id === accountId) ?? null;
                  //   setSelectedAccount(account);
                  // }
                  // }
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
