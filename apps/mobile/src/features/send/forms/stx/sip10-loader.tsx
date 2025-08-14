import { Error } from '@/components/error/error';
import { type FetchState, toFetchState } from '@/components/loading/fetch-state';
import { SendFormLoadingSpinner } from '@/features/send/components/send-form-layout';
import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';
import '@/queries/balance/stx-balance.query';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';
import { useNextNonce } from '@/queries/stacks/nonce/account-nonces.hooks';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { useQueryClient } from '@tanstack/react-query';

import { AccountId, FungibleCryptoAsset, MarketData, Money } from '@leather.io/models';
import { Sip10Balance } from '@leather.io/services';

interface Sip10Data {
  availableBalance: Money;
  quoteBalance: Money;
  nonce: number | undefined;
  marketData: MarketData;
}

function useSip10Data({
  fingerprint,
  accountIndex,
  token,
}: { token: Sip10Balance } & AccountId): FetchState<Sip10Data> {
  const address = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex) ?? '';
  const balance = useSip10AccountBalance(fingerprint, accountIndex);
  const nextNonce = useNextNonce(address);
  const marketData = useMarketDataQuery(token.asset);

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
          availableBalance: token?.crypto.availableBalance,
          quoteBalance: token?.quote.availableBalance,
          nonce: nextNonce.data?.nonce,
          marketData: marketData.data,
        }
      : null,
    isLoading,
    isError,
    error: null,
  });
}

interface Sip10DataLoaderProps {
  account: AccountId;
  children(data: Sip10Data): React.ReactNode;
  asset: FungibleCryptoAsset;
}

export function Sip10DataLoader(props: Sip10DataLoaderProps) {
  const sip10Data = useSip10AccountBalance(props.account.fingerprint, props.account.accountIndex);
  // TODO LEA-3125: improve this to not always need to get all SIP-10 data
  const token = sip10Data.value?.sip10s.find(
    sip10 => props.asset.protocol === 'sip10' && sip10.asset.assetId === props.asset.assetId
  );
  if (!token) return null;

  return <Sip10DataLoaderWithToken {...props} token={token} />;
}

function Sip10DataLoaderWithToken({
  account,
  children,
  token,
}: Sip10DataLoaderProps & { token: Sip10Balance }) {
  const queryClient = useQueryClient();
  const sip10DataQuery = useSip10Data({ ...account, token });

  if (sip10DataQuery.state === 'loading') {
    return <SendFormLoadingSpinner />;
  }

  if (sip10DataQuery.state === 'error') {
    return <Error onRetry={() => queryClient.refetchQueries()} />;
  }

  return children(sip10DataQuery.value);
}
