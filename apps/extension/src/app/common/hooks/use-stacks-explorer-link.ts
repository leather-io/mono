import { useCallback } from 'react';

import { getStacksExplorerLink } from '@leather.io/features';
import { ChainId } from '@leather.io/models';

import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

import { openInNewTab } from '../utils/open-in-new-tab';

interface HandleOpenStacksTxLinkArgs {
  searchParams?: URLSearchParams;
  txid: string;
}

export function useStacksExplorerLink() {
  const { chain, isNakamotoTestnet } = useCurrentNetworkState();
  const mode = chain.stacks.chainId === ChainId.Mainnet ? 'mainnet' : 'testnet';

  const handleOpenStacksTxLink = useCallback(
    ({ searchParams, txid }: HandleOpenStacksTxLinkArgs) => {
      openInNewTab(
        getStacksExplorerLink({
          mode,
          type: 'txid',
          value: txid,
          searchParams,
          isNakamoto: isNakamotoTestnet,
        })
      );
    },
    [mode, isNakamotoTestnet]
  );

  const getStacksAddressLink = useCallback(
    (address: string) =>
      getStacksExplorerLink({
        mode,
        type: 'address',
        value: address,
        isNakamoto: isNakamotoTestnet,
      }),
    [mode, isNakamotoTestnet]
  );

  return { handleOpenStacksTxLink, getStacksAddressLink };
}
