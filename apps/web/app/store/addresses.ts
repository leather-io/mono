import { useMemo } from 'react';

import { atom, useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { analytics } from '~/features/analytics/analytics';
import { leather } from '~/helpers/leather-sdk';
import { type ExtensionState, isLeatherInstalled, whenExtensionState } from '~/helpers/utils';

import { delay } from '@leather.io/utils';

type GetAddressesResult = Awaited<ReturnType<typeof leather.getAddresses>>['addresses'];

export const addressesAtom = atomWithStorage<GetAddressesResult>('addresses', []);

export const extensionStateAtom = atom<ExtensionState>(get => {
  const addresses = get(addressesAtom);
  if (addresses.length !== 0) return 'connected';
  if (isLeatherInstalled()) return 'detected';
  return 'missing';
});

export const stacksAccountAtom = atom(get => {
  const addresses = get(addressesAtom);
  return addresses.find(address => address.symbol === 'STX');
});

export const showMissingStacksKeysDialogAtom = atom(false);

export function useStacksAccount() {
  return useAtomValue(stacksAccountAtom);
}

async function waitForExtensionConnectAnimationToFinish() {
  await delay(750);
}

export function useLeatherConnect() {
  const [addresses, setAddresses] = useAtom(addressesAtom);
  const extensionState = useAtomValue(extensionStateAtom);
  const [showMissingStacksKeysDialog, setShowMissingStacksKeysDialog] = useAtom(
    showMissingStacksKeysDialogAtom
  );

  const stacksAccount = useStacksAccount();

  const btcAddressP2tr = useMemo(
    () => addresses.find(address => address.type === 'p2tr'),
    [addresses]
  );

  const btcAddressP2wpkh = useMemo(
    () => addresses.find(address => address.type === 'p2wpkh'),
    [addresses]
  );

  const accounts = { stacksAccount, btcAddressP2tr, btcAddressP2wpkh };

  return {
    addresses,
    setAddresses,
    showMissingStacksKeysDialog,
    setShowMissingStacksKeysDialog,
    status: extensionState,
    ...accounts,
    whenExtensionState: whenExtensionState(extensionState),
    openExtension() {
      void analytics.untypedTrack('open_extension_clicked');
      void leather.open({ mode: 'fullpage' });
    },
    async connect() {
      const startTime = performance.now();
      void analytics.untypedTrack('sign_in_clicked', { status: 'initiated' });
      try {
        const result = await leather.getAddresses();

        if (!result.addresses.some(address => address.symbol === 'STX')) {
          await waitForExtensionConnectAnimationToFinish();
          setShowMissingStacksKeysDialog(true);

          void analytics.untypedTrack('sign_in_clicked', {
            status: 'error',
            error: 'no_stacks_account',
            duration: performance.now() - startTime,
          });
          return;
        }

        void analytics.untypedTrack('sign_in_clicked', {
          status: 'success',
          duration: performance.now() - startTime,
        });
        setAddresses(result.addresses);
      } catch {
        void analytics.untypedTrack('sign_in_clicked', {
          status: 'error',
          reason: 'user_rejected',
          duration: performance.now() - startTime,
        });
      }
    },
    disconnect() {
      void analytics.untypedTrack('sign_out_clicked');
      setAddresses([]);
    },
  };
}
