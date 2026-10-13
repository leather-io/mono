import { Error } from '@/components/error/error';
import { type FetchState, toFetchState } from '@/components/loading/fetch-state';
import { SendFormLoadingSpinner } from '@/features/send/components/send-form-layout';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';
import { useNextNonce } from '@/queries/stacks/nonce/account-nonces.hooks';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { useQueryClient } from '@tanstack/react-query';

import { AccountId, MarketData, Money } from '@leather.io/models';

interface StxData {
  availableBalance: Money;
  quoteBalance: Money;
  nonce: number | undefined;
  marketData: MarketData;
}

function useStxData(account: AccountId): FetchState<StxData> {
  const { fingerprint, accountIndex } = account;
  const address = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex) ?? '';
  const balance = useStxAccountBalance(fingerprint, accountIndex);
  const marketData = useStxMarketDataQuery();
  const nextNonce = useNextNonce(address);

  // TODO: Replace with aggregate queries once we have more flexible query API
  const isReady =
    balance.state === 'success' &&
    marketData.status === 'success' &&
    nextNonce.status === 'success';
  const isLoading =
    balance.state === 'loading' ||
    marketData.status === 'pending' ||
    nextNonce.status === 'pending';
  const isError =
    balance.state === 'error' || marketData.status === 'error' || nextNonce.status === 'error';

  return toFetchState({
    data: isReady
      ? {
          availableBalance: balance.value.stx.availableUnlockedBalance,
          quoteBalance: balance.value.quote.availableUnlockedBalance,
          nonce: nextNonce.data?.nonce,
          marketData: marketData.data,
        }
      : null,
    isLoading,
    isError,
    error: null,
  });
}

interface StxDataLoaderProps {
  children(data: StxData): React.ReactNode;
  account: AccountId;
}

export function StxDataLoader({ account, children }: StxDataLoaderProps) {
  const queryClient = useQueryClient();
  const stxDataQuery = useStxData(account);

  if (stxDataQuery.state === 'loading') {
    return <SendFormLoadingSpinner />;
  }

  if (stxDataQuery.state === 'error') {
    return <Error onRetry={() => queryClient.refetchQueries()} />;
  }

  return children(stxDataQuery.value);
}
