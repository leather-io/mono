import { useSelector } from 'react-redux';

import { getWalletSessionKey } from '../session-restore';
import { selectWalletSalt } from './software-key.selectors';
import { checkPassword } from './utils';

export function useCheckPassword() {
  const salt = useSelector(selectWalletSalt);

  return async ({ password }: { password: string }) => {
    const encryptionKey = (await getWalletSessionKey()).data;
    if (!salt || !encryptionKey) return false;

    return checkPassword({ password, salt, encryptionKey });
  };
}
