import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  type SoftwareKeyStateSnapshot,
  createSoftwareKeyState,
  readPersistedSoftwareKeyState,
} from '@app/store/software-keys/software-key-state';
import { selectWalletAuthenticationCapabilities } from '@app/store/software-keys/software-key.selectors';
import { hydrateSlicesFromStorage } from '@app/store/utils/storage-sync';

import {
  type WalletAuthenticationResult,
  authenticateWithPlatformCredential,
} from './wallet-authentication';

interface WalletAuthenticationSnapshot {
  capabilities: ReturnType<typeof selectWalletAuthenticationCapabilities.resultFunc>;
  state: SoftwareKeyStateSnapshot;
}

function invalidConfigResult(): WalletAuthenticationResult<never> {
  return { status: 'failure', code: 'invalid-config' };
}

async function loadWalletAuthenticationSnapshot(
  dispatch: ReturnType<typeof useDispatch>
): Promise<WalletAuthenticationResult<WalletAuthenticationSnapshot>> {
  try {
    const persisted = await readPersistedSoftwareKeyState();
    if (persisted.status !== 'valid') return { status: 'failure', code: 'invalid-config' };
    const capabilities = selectWalletAuthenticationCapabilities.resultFunc({
      authenticationMode: persisted.value.authenticationMode,
      ids: persisted.value.keys.map(key => key.id),
      platformUnlock: persisted.value.platformUnlock,
      salt: persisted.value.salt,
    });
    if (!capabilities.valid || persisted.value.keys.length === 0) {
      return { status: 'failure', code: 'invalid-config' };
    }
    dispatch(hydrateSlicesFromStorage({ softwareKeys: createSoftwareKeyState(persisted.value) }));
    return { status: 'success', value: { capabilities, state: persisted.value } };
  } catch {
    return { status: 'failure', code: 'unavailable' };
  }
}

export function useWalletAuthentication() {
  const capabilities = useSelector(selectWalletAuthenticationCapabilities);
  const dispatch = useDispatch();

  return useMemo(
    () => ({
      capabilities,
      async authenticateWithPlatformCredential() {
        const current = await loadWalletAuthenticationSnapshot(dispatch);
        if (current.status === 'failure') return current;
        if (!current.value.capabilities.biometrics) {
          return invalidConfigResult();
        }
        return authenticateWithPlatformCredential({
          platformUnlock: current.value.state.platformUnlock,
          softwareKeys: current.value.state.keys,
        });
      },
    }),
    [capabilities, dispatch]
  );
}
