import { Error } from '@/components/error/error';
import { SendFormLoadingSpinner } from '@/features/send/components/send-form-layout';
import { useSip10BalanceByAssetId } from '@/queries/balance/sip10-balance.query';
import '@/queries/balance/stx-balance.query';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';
import { useNextNonce } from '@/queries/stacks/nonce/account-nonces.hooks';
import { Account } from '@/store/accounts/accounts';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { useQueryClient } from '@tanstack/react-query';

import { MarketData, Sip10Asset } from '@leather.io/models';
import { Sip10Balance } from '@leather.io/services';

interface Sip10SendLoaderData {
  balance: Sip10Balance;
  nonce: number | undefined;
  marketData: MarketData;
}

interface Sip10DataLoaderProps {
  account: Account;
  children(data: Sip10SendLoaderData): React.ReactNode;
  asset: Sip10Asset;
}

export function Sip10DataLoader({ account, asset, children }: Sip10DataLoaderProps) {
  const address =
    useStacksSignerAddressFromAccountIndex(account.fingerprint, account.accountIndex) ?? '';
  const queryClient = useQueryClient();
  const sip10Balance = useSip10BalanceByAssetId(
    account.fingerprint,
    account.accountIndex,
    asset.assetId
  );
  const marketData = useMarketDataQuery(asset);
  const nextNonce = useNextNonce(address);

  const isLoading =
    sip10Balance.state === 'loading' ||
    marketData.status === 'pending' ||
    nextNonce.status === 'pending';

  const isError =
    sip10Balance.state === 'error' || marketData.status === 'error' || nextNonce.status === 'error';

  if (isLoading) {
    return <SendFormLoadingSpinner />;
  }

  if (isError) {
    return <Error onRetry={() => queryClient.refetchQueries()} />;
  }

  return children({
    balance: sip10Balance.value,
    nonce: nextNonce.data?.nonce,
    marketData: marketData.data,
  });
}
