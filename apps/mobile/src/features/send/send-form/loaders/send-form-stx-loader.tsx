import { useStxAddressBalanceQuery } from '@/queries/balance/stx-balance.query';
import { useNextNonce } from '@/queries/stacks/nonce/account-nonces.hooks';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';

import { AccountId, Money } from '@leather.io/models';

interface SendFormStxData {
  availableBalance: Money;
  fiatBalance: Money;
  nonce: number | string;
}

interface SendFormStxLoaderProps {
  account: AccountId;
  children({ availableBalance, fiatBalance, nonce }: SendFormStxData): React.ReactNode;
}
export function SendFormStxLoader({ account, children }: SendFormStxLoaderProps) {
  const address =
    useStacksSignerAddressFromAccountIndex(account.fingerprint, account.accountIndex) ?? '';

  const {
    data: balance,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
  } = useStxAddressBalanceQuery(address);

  const { data: nextNonce } = useNextNonce(address);

  if (!address || !nextNonce || isBalanceLoading || isBalanceError) return null;

  return children({
    availableBalance: balance!.stx.availableBalance,
    fiatBalance: balance!.fiat.availableBalance,
    nonce: nextNonce?.nonce ?? '',
  });
}
