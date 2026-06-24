import { useEffect, useRef } from 'react';

import {
  getBnsV2ApiClient,
  getHiroStacksApiClient,
  getLeatherApiClient,
} from '@leather.io/services';

import { useAppDispatch } from '@app/store';
import { useInMemoryKeys } from '@app/store/in-memory-key/use-in-memory-keys';
import { keyActions } from '@app/store/software-keys/software-key.actions';
import { useWallets } from '@app/store/wallets/wallet.selectors';

export function useProbeNextAccountForActivity(enabled: boolean) {
  const dispatch = useAppDispatch();
  const wallets = useWallets();
  const { hasKey } = useInMemoryKeys();
  const hasProbed = useRef(false);
  const hasSoftwareWalletKey = wallets.some(
    wallet => wallet.type === 'software' && hasKey(wallet.fingerprint)
  );

  useEffect(() => {
    if (!enabled) return;
    if (!hasSoftwareWalletKey) return;
    if (hasProbed.current) return;

    hasProbed.current = true;
    void dispatch(
      keyActions.probeNextAccountAndDiscoverAccounts({
        leatherApiClient: getLeatherApiClient(),
        hiroClient: getHiroStacksApiClient(),
        bnsClient: getBnsV2ApiClient(),
      })
    );
  }, [dispatch, enabled, hasSoftwareWalletKey]);
}
