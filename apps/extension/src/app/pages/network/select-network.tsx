import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Flex, styled } from 'leather-styles/jsx';

import { WalletDefaultNetworkConfigurationIds } from '@leather.io/models';
import { Button } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { Content } from '@app/components/layout';
import { Header } from '@app/components/layout/headers/header';
import { HeaderBackButton } from '@app/components/layout/headers/header-back-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { useCurrentNetworkState } from '@app/query/leather-query-provider';
import { useNavigate } from '@app/routes/compat';
import { useAppDispatch } from '@app/store';
import { miscNavigationSlice } from '@app/store/navigation/misc-navigation.slice';
import { useNetworksActions } from '@app/store/networks/networks.hooks';
import { useNetworks } from '@app/store/networks/networks.selectors';
import { useToggleNetworkBadgeAlwaysOn } from '@app/store/settings/settings.actions';
import { useNetworkBadgeAlwaysOn } from '@app/store/settings/settings.selectors';

import { NetworkListItem } from './components/network-list-item';
import { NetworkListSwitch } from './components/network-list-switch';

const defaultNetworkIds = Object.values(WalletDefaultNetworkConfigurationIds) as string[];

export function SelectNetwork() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
          px="space.05"
        >
          <Flex direction="column">
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
                    dispatch(
                      miscNavigationSlice.actions.setNetworkEditState({
                        isEditNetworkMode: true,
                        network: networks[id],
                      })
                    );
                    void navigate(RouteUrls.EditNetwork);
                  }}
                />
              ))}
            </Flex>
          </Flex>

          <Flex
            gap="space.02"
            pb="space.05"
            pt="space.03"
            px="space.05"
            mx="-space.05"
            background="ink.background-primary"
            position="sticky"
            bottom={0}
            flexDirection="column"
            boxShadow="contentOverflowFade"
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
          </Flex>
        </Flex>
      </Content>
    </Flex>
  );
}
