import { useNavigate } from 'react-router';

import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import { WalletDefaultNetworkConfigurationIds } from '@leather.io/models';
import { Button, StickyFooter } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { useCurrentNetworkState } from '@app/query/leather-query-provider';
import { useNetworksActions } from '@app/store/networks/networks.hooks';
import { useNetworks } from '@app/store/networks/networks.selectors';
import { useToggleNetworkBadgeAlwaysOn } from '@app/store/settings/settings.actions';
import { useNetworkBadgeAlwaysOn } from '@app/store/settings/settings.selectors';

import { NetworkListItem } from './components/network-list-item';
import { NetworkListSwitch } from './components/network-list-switch';

const defaultNetworkIds = Object.values(WalletDefaultNetworkConfigurationIds) as string[];

export function SelectNetwork() {
  const navigate = useNavigate();
  const networks = useNetworks();
  const networksActions = useNetworksActions();
  const currentNetwork = useCurrentNetworkState();
  const networkBadgeAlwaysOn = useNetworkBadgeAlwaysOn();
  const toggleNetworkBadgeAlwaysOn = useToggleNetworkBadgeAlwaysOn();

  function addNetwork() {
    analytics.track('add_network');
    void navigate(RouteUrls.AddNetwork);
  }

  function removeNetwork(id: string) {
    analytics.track('remove_network');
    networksActions.removeNetwork(id);
  }

  function selectNetwork(id: string) {
    analytics.track('change_network', { id });
    networksActions.changeNetwork(id);
  }

  return (
    <Flex height="100vh" direction="column">
      <Header px="space.04">
        <HeaderGrid leftCol={<HeaderBackButton />} rightCol={null} />
      </Header>
      <Content>
        <Flex
          direction="column"
          width="100%"
          position="relative"
          justifyContent="space-between"
          height="100%"
        >
          <Flex direction="column" px="space.05">
            <styled.h1 textStyle="heading.03" pb="space.05">
              Network
            </styled.h1>
            <Flex direction="column" gap="space.01">
              {Object.keys(networks).map(id => (
                <NetworkListItem
                  key={id}
                  networkId={id}
                  onSelectNetwork={() => selectNetwork(id)}
                  isCustom={!defaultNetworkIds.includes(id)}
                  onRemoveNetwork={() => {
                    if (id === currentNetwork.id) networksActions.changeNetwork('mainnet');
                    removeNetwork(id);
                  }}
                  onEditNetwork={() => {
                    void navigate(RouteUrls.EditNetwork, {
                      state: {
                        network: networks[id],
                      },
                    });
                  }}
                />
              ))}
            </Flex>
          </Flex>

          <StickyFooter
            gap="space.02"
            pb="space.05"
            pt="space.03"
            background="ink.background-primary"
            px="space.05"
            flexDirection="column"
          >
            <NetworkListSwitch
              data-testid={SettingsSelectors.ToggleNetworkBadge}
              title="Always show network"
              caption="Switch networks faster"
              isEnabled={networkBadgeAlwaysOn}
              onClick={toggleNetworkBadgeAlwaysOn}
            />
            <Button
              data-testid={SettingsSelectors.AddNewNetworkBtn}
              fullWidth
              variant="outline"
              onClick={addNetwork}
            >
              Add network
            </Button>
          </StickyFooter>
        </Flex>
      </Content>
    </Flex>
  );
}
