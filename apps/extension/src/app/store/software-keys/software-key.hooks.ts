import { useAppDispatch } from '@app/store';

import { keyActions } from './software-key.actions';

export function useCheckPassword() {
  const dispatch = useAppDispatch();

  return async ({ password }: { password: string }) => {
    const authentication = await Promise.resolve(dispatch(keyActions.unlockWalletAction(password)))
      .then(() => true)
      .catch(() => false);

    // TODO: double check that it is OK to return false if the data is not available
    if (!authentication) return false;

    return true;
  };
}
