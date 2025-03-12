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
  return {
    addresses,
    setAddresses,
    status,
    async connect() {
      const result = await leather.getAddresses();
      setAddresses(result.addresses);
    },
    disconnect() {
      setAddresses([]);
    },
  };
}
