import { useSettings } from '@/store/settings/settings';

import { AccountId } from '@leather.io/models';
import { assertExistence } from '@leather.io/utils';

export function useCurrentAccount(): AccountId {
  const { currentAccount } = useSettings();
  assertExistence(
    currentAccount,
    "Attempted to use 'currentAccount' before one was set. " +
      'Ensure this hook is only called after an account has been created and selected.'
  );
  return currentAccount;
}
