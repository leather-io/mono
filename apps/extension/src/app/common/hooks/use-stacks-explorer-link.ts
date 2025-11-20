import { useCallback } from 'react';

import { getHiroExplorerLink } from '@leather.io/features';
import { ChainId } from '@leather.io/models';

import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

import { openInNewTab } from '../utils/open-in-new-tab';

interface HandleOpenStacksTxLinkArgs {
  searchParams?: URLSearchParams;
  txid: string;
}
export function useStacksExplorerLink() {
  const { chain, isNakamotoTestnet } = useCurrentNetworkState();

  const handleOpenStacksTxLink = useCallback(
    ({ searchParams, txid }: HandleOpenStacksTxLinkArgs) => {
      openInNewTab(
        getHiroExplorerLink({
          mode: chain.stacks.chainId === ChainId.Mainnet ? 'mainnet' : 'testnet',
          type: 'txid',
          value: txid,
          searchParams,
          isNakamoto: isNakamotoTestnet,
        })
      );
    },
    [chain.stacks.chainId, isNakamotoTestnet]
  );

  return { handleOpenStacksTxLink };
}
