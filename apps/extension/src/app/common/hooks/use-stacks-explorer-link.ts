import { useCallback } from 'react';

import { getStacksExplorerApiUrl, getStacksExplorerLink } from '@leather.io/features';
import { stacksChainIdToCoreNetworkMode } from '@leather.io/stacks';

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
        getStacksExplorerLink({
          mode: stacksChainIdToCoreNetworkMode(chain.stacks.chainId),
          type: 'txid',
          value: txid,
          searchParams,
          isNakamoto: isNakamotoTestnet,
          apiUrl: getStacksExplorerApiUrl(chain.stacks.url),
        })
      );
    },
    [chain.stacks.chainId, chain.stacks.url, isNakamotoTestnet]
  );

  return { handleOpenStacksTxLink };
}
