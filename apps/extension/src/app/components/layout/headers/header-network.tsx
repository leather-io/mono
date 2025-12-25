import { ChainId } from '@leather.io/models';
import { NetworkModeBadge } from '@leather.io/ui';

import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

import { HeaderGridRightCol } from './header-grid';

export function HeaderNetwork() {
  const { chain, name: chainName } = useCurrentNetworkState();

  return (
    <HeaderGridRightCol>
      <NetworkModeBadge
        isTestnetChain={chain.stacks.chainId === ChainId.Testnet}
        name={chainName}
      />
    </HeaderGridRightCol>
  );
}
