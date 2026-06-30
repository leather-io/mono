import { type ReactNode } from 'react';
import { useLocation } from 'react-router';

import { Flex, styled } from 'leather-styles/jsx';
import { useStacksNetwork } from '~/store/stacks-network';

import { Button } from '@leather.io/ui';

import { routeSupportsNetwork } from './network-support';

// Graceful fail for routes that don't support the active network. The network
// switch is global, so a route that only works on mainnet (most of the app)
// shows this instead of breaking when the app is on testnet. No-ops on mainnet,
// where every route is supported.
export function NetworkGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { networkName, setNetworkName } = useStacksNetwork();

  if (routeSupportsNetwork(location.pathname, networkName)) return children;

  return (
    <Flex
      direction="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      gap="space.04"
      minHeight="60vh"
      px="space.04"
    >
      <styled.h2 textStyle="heading.04">Not available on {networkName}</styled.h2>
      <styled.p textStyle="body.02" color="ink.text-subdued" maxWidth="420px">
        This page doesn't support {networkName}.
      </styled.p>
      <Button variant="solid" onClick={() => setNetworkName('mainnet')}>
        Switch to mainnet
      </Button>
    </Flex>
  );
}
