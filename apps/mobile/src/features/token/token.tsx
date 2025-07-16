import { useState } from 'react';

import { TokenIcon } from '@/features/token/components/token-icon';
import {
  useAssetDescriptionQuery,
  useAssetPriceChangeQuery,
} from '@/queries/assets/fungible-asset-info.query';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';
import { Account } from '@/store/accounts/accounts';

import { Text } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { AccountList } from './account-list-item';
import { TokenActivity } from './components/token-activity';
import { TokenDetails } from './components/token-details';
import { useGetAccountTokenBalance, useGetTokenBalance } from './hooks/use-get-token-balance';

interface TokenProps {
  tokenId: string;
}
export function Token({ tokenId }: TokenProps) {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  // const [selectedToken, setSelectedToken] = useState<string | null>(tokenId);
  // const tokenTicker = tokenId ? tokenId : 'STX';
  const tokenBalance = useGetTokenBalance({ tokenId });

  // const accounts = useAccounts();
  // const accounts = useAccounts();
  // this causes a crash when selectedAccount is set
  const accountTokenBalance = useGetAccountTokenBalance({
    tokenId,
    account: selectedAccount!,
  });

  const balance = selectedAccount ? accountTokenBalance : tokenBalance;
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
  // >> setting the accountId in state crashes the whole page!

  // but why? does it reset the tokenId or something? it must
  return (
    <TokenActivity
      ticker={tokenId}
      // TokenDetails passed as ListHeader to avoid nested scrolling errors
      ListHeader={
        <TokenDetails
          // onclick of accountList could just add an account to state?
          // then filter activity further based on that?
          accountDetails={
            selectedAccount !== null ? (
              <Text>Selected Account</Text>
            ) : (
              <AccountList
                tokenId={tokenId}
                selectAccount={
                  // accountId =>
                  // setSelectedAccount(
                  //   accounts.list.find(account => account.id === accountId) ?? null
                  // )
                  // (accountId: string) => console.log('accountId', accountId)
                  (account: Account) => {
                    // const account = accounts.list.find(account => account.id === accountId) ?? null;
                    setSelectedAccount(account);
                  }
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
  );
}
