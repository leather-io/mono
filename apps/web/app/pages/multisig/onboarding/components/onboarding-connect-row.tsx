import { Box, Flex, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { Badge } from '../../components/badge';
import { ChainAvatar } from '../../components/chain-avatar';
import type { Chain } from '../../data/multisig-types';

interface OnboardingConnectRowProps {
  chain: Chain;
  connected: boolean;
  onConnect(): void;
}

export function OnboardingConnectRow({ chain, connected, onConnect }: OnboardingConnectRowProps) {
  const label = chain === 'btc' ? 'Bitcoin' : 'Stacks';
  const desc = chain === 'btc' ? 'Sign PSBT-based BTC vaults' : 'Sign on-chain STX & sBTC vaults';
  return (
    <Flex
      alignItems="center"
      gap="space.03"
      p="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
    >
      <Box flexShrink={0}>
        <ChainAvatar chain={chain} size="lg" />
      </Box>
      <Box flex={1} minWidth={0}>
        <styled.div textStyle="label.02">Connect {label}</styled.div>
        <styled.div textStyle="caption.01" color="ink.text-subdued">
          {desc}
        </styled.div>
      </Box>
      {connected ? (
        <Badge variant="success" label="Connected" />
      ) : (
        <Button variant="solid" onClick={onConnect}>
          Connect
        </Button>
      )}
    </Flex>
  );
}
