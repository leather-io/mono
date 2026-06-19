import { useCallback } from 'react';

import { analytics } from '@shared/utils/analytics';

import { useKeyActions } from '@app/common/hooks/use-key-actions';
import { useToast } from '@app/features/toasts/use-toast';

export function useCreateAccount() {
  const { createNewAccount } = useKeyActions();
  const toast = useToast();

  return useCallback(
    async (fingerprint?: string) => {
      analytics.track('create_new_account');
      try {
        await createNewAccount(fingerprint);
        toast.success('Account created!');
      } catch {
        toast.error('Error creating account.');
      }
    },
    [createNewAccount, toast]
  );
}
