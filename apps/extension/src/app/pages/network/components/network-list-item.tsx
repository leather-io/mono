import { NetworkSelectors } from '@tests/selectors/network.selectors';
import { SettingsSelectors } from '@tests/selectors/settings.selectors';
import { Box, Flex, styled } from 'leather-styles/jsx';

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
  isPolicyLocked: boolean;
  onSelectNetwork(): void;
  onRemoveNetwork(): void;
  onEditNetwork(): void;
}
export function NetworkListItem({
  networkId,
  onSelectNetwork,
  onRemoveNetwork,
  isCustom,
  isPolicyLocked,
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
      <styled.div
        position="relative"
        mx="-space.05"
        px="space.05"
        py="space.03"
        borderRadius="xs"
        opacity={!isOnline ? 0.5 : 1}
        zIndex="0"
      >
        <styled.button
          position="absolute"
          bottom={0}
          top={0}
          right={0}
          left={0}
          cursor={getCursorStyle(isOnline, isActive)}
          onClick={unselectable ? undefined : onSelectNetwork}
          data-testid={network.id}
          aria-disabled={unselectable}
          _hover={
            unselectable
              ? undefined
              : {
                  backgroundColor: 'ink.component-background-hover',
                }
          }
        />
        <ItemLayoutWithButtons
          title={truncateString(network.name, 20)}
          caption={getUrlHostname(network.chain.stacks.url)}
          img={null}
          buttons={
            <Flex gap="space.02" zIndex="70" justifyContent="center">
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
                  isPolicyLocked={isPolicyLocked}
                  onClickDeleteNetwork={onRemoveNetwork}
                  onEditNetwork={onEditNetwork}
                />
              )}
            </Flex>
          }
        />
      </styled.div>
    </Flex>
  );
}
