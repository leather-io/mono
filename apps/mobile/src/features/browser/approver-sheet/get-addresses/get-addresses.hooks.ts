import { useAccounts } from '@/store/accounts/accounts.read';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { destructAccountIdentifier } from '@/store/utils';
import { useWallets } from '@/store/wallets/wallets.read';

export function useGetAddressesAccount(accountId: string | null) {
  const { fromAccountIndex: stacksAccountFromAccountIndex } = useStacksSigners();
  const { accountIndexByPaymentType } = useBitcoinAccounts();
  const { fromAccountIndex: accountFromAccountIndex } = useAccounts();
  const { hasWallets } = useWallets();
  if (!hasWallets) return null;
  if (!accountId) return null;
  const { fingerprint, accountIndex } = destructAccountIdentifier(accountId);
  const account = accountFromAccountIndex(fingerprint, accountIndex);

  if (!account) return null;

  const stacksAccount = stacksAccountFromAccountIndex(fingerprint, accountIndex)[0];
  const { nativeSegwit, taproot } = accountIndexByPaymentType(fingerprint, accountIndex);

  const taprootPayer = taproot?.derivePayer({ change: 0, addressIndex: 0 });
  const nativeSegwitPayer = nativeSegwit?.derivePayer({ change: 0, addressIndex: 0 });
  if (!stacksAccount || !nativeSegwitPayer || !taprootPayer)
    throw new Error('some of the accounts are not available');
  return { fingerprint, accountIndex, taprootPayer, nativeSegwitPayer, stacksAccount };
}
