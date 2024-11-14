import { AccountId } from '@/models/domain.model';
import { useStxBalance } from '@/queries/balance/stacks-balance.query';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';

import { Money } from '@leather.io/models';
import { useNextNonce } from '@leather.io/query';

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
  const { availableBalance, fiatBalance } = useStxBalance([address]);

  const { data: nextNonce } = useNextNonce(address);

  if (!address || !nextNonce) return null;

  return children({
    availableBalance,
    fiatBalance,
    nonce: nextNonce?.nonce ?? '',
  });
}
