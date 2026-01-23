import { useSelector } from 'react-redux';

import { bitcoinNetworkModeToCoreNetworkMode, inferNetworkFromPath } from '@leather.io/bitcoin';

import { selectAllBitcoinKeychains } from '@app/store/ledger/bitcoin/bitcoin-key.slice';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

// TODO: Asset refactor: remove if determined unnecessary
// ts-unused-exports:disable-next-line
export function useHasBitcoinLedgerKeychain() {
  const network = useCurrentNetwork();
  const accounts = useSelector(selectAllBitcoinKeychains);

  const hasNetworkKeys = accounts.some(v => {
    return (
      inferNetworkFromPath(v.path) ===
      bitcoinNetworkModeToCoreNetworkMode(network.chain.bitcoin.mode)
    );
  });

  return hasNetworkKeys;
}

export function useFilteredBitcoinAccounts() {
  const accounts = useSelector(selectAllBitcoinKeychains);
  const network = useCurrentNetwork();

  return accounts.filter(v => {
    return (
      inferNetworkFromPath(v.path) ===
      bitcoinNetworkModeToCoreNetworkMode(network.chain.bitcoin.mode)
    );
  });
}
