import { useMemo } from 'react';

import { atom, useAtom, useAtomValue } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { leather } from '~/helpers/leather-sdk';
import { type ExtensionState, isLeatherInstalled } from '~/helpers/utils';

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
  const status = useAtomValue(extensionStateAtom);

  const stxAddress = useMemo(
    () => addresses.find(address => address.symbol === 'STX'),
    [addresses]
  );

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
    status,
    stxAddress,
    btcAddressP2tr,
    btcAddressP2wpkh,
    openExtension() {
      void leather.open({ mode: 'fullpage' });
    },
    async connect() {
      const result = await leather.getAddresses();
      setAddresses(result.addresses);
    },
    disconnect() {
      setAddresses([]);
    },
  };
}
