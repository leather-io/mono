import { useStxAddressBalanceQuery } from '@/queries/balance/stx-balance.query';
import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';
import { useNextNonce } from '@/queries/stacks/nonce/account-nonces.hooks';
import { type Account } from '@/store/accounts/accounts';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';

export function usePreloadStxData(account: Account | null) {
  const { accountIndex, fingerprint } = account ?? { accountIndex: 0, fingerprint: '' };

  const address = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex) ?? '';
  useStxAddressBalanceQuery(address);
  useStxMarketDataQuery();
  useNextNonce(address);
}
