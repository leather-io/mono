import { useSelector } from 'react-redux';

import { bitcoinNetworkModeToCoreNetworkMode, inferNetworkFromPath } from '@leather.io/bitcoin';
import { extractDerivationPathFromDescriptor } from '@leather.io/crypto';

import { selectBitcoinKeychains } from '@app/store/keychains/keychain.selectors';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

// TODO: Asset refactor: remove if determined unnecessary
// ts-unused-exports:disable-next-line
export function useHasBitcoinLedgerKeychain() {
  const network = useCurrentNetwork();
  const keychains = useSelector(selectBitcoinKeychains);

  const hasNetworkKeys = keychains.some(keychain => {
    const path = extractDerivationPathFromDescriptor(keychain.descriptor);
    return (
      inferNetworkFromPath(path) === bitcoinNetworkModeToCoreNetworkMode(network.chain.bitcoin.mode)
    );
  });

  return hasNetworkKeys;
}

export function useFilteredBitcoinAccounts() {
  const keychains = useSelector(selectBitcoinKeychains);
  const network = useCurrentNetwork();

  return keychains
    .map(keychain => {
      const path = extractDerivationPathFromDescriptor(keychain.descriptor);
      return { ...keychain, path };
    })
    .filter(v => {
      return (
        inferNetworkFromPath(v.path) ===
        bitcoinNetworkModeToCoreNetworkMode(network.chain.bitcoin.mode)
      );
    });
}
