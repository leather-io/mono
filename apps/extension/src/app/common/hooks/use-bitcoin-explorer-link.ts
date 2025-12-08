import { useCallback } from 'react';

import { getBitcoinExplorerLink } from '@leather.io/features';

import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

import { openInNewTab } from '../utils/open-in-new-tab';

interface HandleOpenBitcoinTxLinkArgs {
  txid: string;
}

export function useBitcoinExplorerLink() {
  const { chain } = useCurrentNetworkState();
  const { bitcoin } = chain;
  const handleOpenBitcoinTxLink = useCallback(
    ({ txid }: HandleOpenBitcoinTxLinkArgs) => {
      const link = getBitcoinExplorerLink({
        id: txid,
        type: 'tx',
        networkPreference: bitcoin.bitcoinNetwork,
      });
      if (link) {
        openInNewTab(link);
      }
    },
    [bitcoin]
  );

  return {
    handleOpenBitcoinTxLink,
  };
}
