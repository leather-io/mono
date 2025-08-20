import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';
import { useNextNonce } from '@/queries/stacks/nonce/account-nonces.hooks';
import { Account } from '@/store/accounts/accounts';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';

export function usePreloadStxData(account: Account) {
  const { fingerprint, accountIndex } = account;
  const address = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex) ?? '';
  useStxAccountBalance(fingerprint, accountIndex);
  useStxMarketDataQuery();
  useNextNonce(address);
}
