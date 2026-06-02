import { Box, Circle, Flex, styled } from 'leather-styles/jsx';

import { Badge, Button } from '@leather.io/ui';

import { ChainGlyph } from '../../components/chain-glyph';
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
      <Circle size="36px" bg="ink.background-secondary" flexShrink={0}>
        <ChainGlyph chain={chain} variant="medium" />
      </Circle>
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
