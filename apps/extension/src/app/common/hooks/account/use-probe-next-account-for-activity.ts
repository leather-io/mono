import { useEffect, useRef } from 'react';

import { useBitcoinClient } from '@app/query/bitcoin/clients/bitcoin-client';
import { useBnsV2Client } from '@app/query/stacks/bns/bns-v2-client';
import { useAppDispatch } from '@app/store';
import { useStacksClient } from '@app/store/common/api-clients.hooks';
import { useInMemoryKeys } from '@app/store/in-memory-key/use-in-memory-keys';
import { keyActions } from '@app/store/software-keys/software-key.actions';
import { useWallets } from '@app/store/wallets/wallet.selectors';

export function useProbeNextAccountForActivity(enabled: boolean) {
  const dispatch = useAppDispatch();
  const btcClient = useBitcoinClient();
  const stxClient = useStacksClient();
  const bnsV2Client = useBnsV2Client();
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
        bnsV2Client,
        btcClient,
        stxClient,
      })
    );
  }, [bnsV2Client, btcClient, dispatch, enabled, hasSoftwareWalletKey, stxClient]);
}
