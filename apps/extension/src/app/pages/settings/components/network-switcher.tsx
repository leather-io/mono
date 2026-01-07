import { useNavigate } from 'react-router';

import { styled } from 'leather-styles/jsx';

import { ChainId } from '@leather.io/models';
import { NetworkModeBadge } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';
import { useNetworkBadgeAlwaysOn } from '@app/store/settings/settings.selectors';

export function NetworkSwitcherBadge() {
  const { chain, name: chainName } = useCurrentNetworkState();
  const navigate = useNavigate();
  const networkBadgeAlwaysOn = useNetworkBadgeAlwaysOn();

  return (
    <styled.button
      onClick={() => {
        void navigate(RouteUrls.SelectNetwork);
      }}
    >
      <NetworkModeBadge
        isVisible={networkBadgeAlwaysOn || chain.stacks.chainId === ChainId.Testnet}
        name={chainName}
      />
    </styled.button>
  );
}
