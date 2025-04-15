import { useMemo } from 'react';

import { atom, useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { analytics } from '~/features/analytics/analytics';
import { leather } from '~/helpers/leather-sdk';
import { type ExtensionState, isLeatherInstalled, whenExtensionState } from '~/helpers/utils';
import { useStacksNetwork } from '~/store/stacks-network';

type GetAddressesResult = Awaited<ReturnType<typeof leather.getAddresses>>['addresses'];

export const addressesAtom = atomWithStorage<GetAddressesResult>('addresses', []);

export const extensionStateAtom = atom<ExtensionState>(get => {
  const addresses = get(addressesAtom);
  if (addresses.length !== 0) return 'connected';
  if (isLeatherInstalled()) return 'detected';
  return 'missing';
});

export function useLeatherConnect() {
  const [addresses, setAddresses] = useAtom(addressesAtom);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { networkName, setNetworkName } = useStacksNetwork();
  const extensionState = useAtomValue(extensionStateAtom);

  const stacksAccount = useStacksAccount();

  const btcAddressP2tr = useMemo(
    () => addresses.find(address => address.type === 'p2tr'),
    [addresses]
  );

  const btcAddressP2wpkh = useMemo(
    () => addresses.find(address => address.type === 'p2wpkh'),
    [addresses]
  );

  return {
    addresses,
    setAddresses,
    status: extensionState,
    stacksAccount,
    btcAddressP2tr,
    btcAddressP2wpkh,
    whenExtensionState: whenExtensionState(extensionState),
    openExtension() {
      void analytics.untypedTrack('open_extension_clicked');
      void leather.open({ mode: 'fullpage' });
    },
    async connect() {
      void analytics.untypedTrack('sign_in_clicked', { status: 'initiated' });
      try {
        const result = await leather.getAddresses();
        void analytics.untypedTrack('sign_in_clicked', { status: 'success' });
        setAddresses(result.addresses);
      } catch {
        void analytics.untypedTrack('sign_in_clicked', { status: 'error' });
      }
    },
    disconnect() {
      void analytics.untypedTrack('sign_out_clicked');
      setAddresses([]);
    },
  };
}

export function useStacksAccount() {
  const [addresses] = useAtom(addressesAtom);
  const stacksAccount = useMemo(
    () => addresses.find(address => address.symbol === 'STX'),
    [addresses]
  );

  return stacksAccount;
}
