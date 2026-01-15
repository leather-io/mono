import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { css } from 'leather-styles/css';
import { Box, Flex } from 'leather-styles/jsx';

import { defaultCurrentNetwork } from '@leather.io/models';
import { CheckmarkCircleIcon, CloudOffIcon, ItemLayoutWithButtons } from '@leather.io/ui';

import { getUrlHostname, truncateString } from '@app/common/utils';
import { NetworkItemMenu } from '@app/pages/network/components/network-list-item-menu';
import { useGetStacksNetworkStatusQuery } from '@app/query/stacks/network/network.query';
import { useCurrentNetworkId, useNetworks } from '@app/store/networks/networks.selectors';

function getCursorStyle(isOnline: boolean, isActive: boolean) {
  if (!isOnline) return 'not-allowed';
  if (isActive) return 'default';
  return 'pointer';
}

interface NetworkListItemProps {
  networkId: string;
  isCustom: boolean;
  onSelectNetwork(): void;
  onRemoveNetwork(): void;
  onEditNetwork(): void;
}
export function NetworkListItem({
  networkId,
  onSelectNetwork,
  onRemoveNetwork,
  isCustom,
  onEditNetwork,
}: NetworkListItemProps) {
  const currentNetworkId = useCurrentNetworkId();
  const networks = useNetworks();

  const network = networks[networkId] || defaultCurrentNetwork;
  const { isSuccess: isOnline } = useGetStacksNetworkStatusQuery(network.chain.stacks.url);
  const isActive = networkId === currentNetworkId;
  const unselectable = !isOnline || isActive;

  return (
    <Flex direction="column" data-testid={SettingsSelectors.NetworkListItem}>
      <button
        className={css({
          _hover: unselectable
            ? undefined
            : {
                backgroundColor: 'ink.component-background-hover',
              },
          mx: '-space.05',
          px: 'space.05',
          py: 'space.03',
          borderRadius: 'xs',
          cursor: getCursorStyle(isOnline, isActive),
          opacity: !isOnline ? 0.5 : 1,
        })}
        onClick={unselectable ? undefined : onSelectNetwork}
        data-testid={network.id}
        aria-disabled={unselectable}
      >
        <ItemLayoutWithButtons
          title={truncateString(network.name, 20)}
          caption={getUrlHostname(network.chain.stacks.url)}
          img={null}
          buttons={
            <Flex gap="space.02" justifyContent="center">
              {isActive && (
                <Box p="space.02">
                  <CheckmarkCircleIcon
                    variant="medium"
                    data-testid={NetworkSelectors.NetworkListActiveNetwork}
                  />
                </Box>
              )}
              {!isOnline ? (
                <Box p="space.02">
                  <CloudOffIcon />
                </Box>
              ) : null}
              {isOnline && isCustom && (
                <NetworkItemMenu
                  onClickDeleteNetwork={onRemoveNetwork}
                  onEditNetwork={onEditNetwork}
                />
              )}
            </Flex>
          }
        />
      </button>
    </Flex>
  );
}
