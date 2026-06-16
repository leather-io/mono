import { Box, Flex, styled } from 'leather-styles/jsx';

import { ChainAvatar } from '../../components/chain-avatar';
import type { Chain } from '../../data/multisig-types';

interface ChainPickerProps {
  chain: Chain;
  connected: Record<Chain, boolean>;
  onChange(chain: Chain): void;
}

const chains: { id: Chain; label: string }[] = [
  { id: 'btc', label: 'Bitcoin multisig' },
  { id: 'stx', label: 'Stacks multisig' },
];

export function ChainPicker({ chain, connected, onChange }: ChainPickerProps) {
  return (
    <Flex gap="space.03">
      {chains.map(option => {
        const selected = chain === option.id;
        const isConnected = connected[option.id];
        return (
          <styled.button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={selected}
            flex={1}
            display="flex"
            alignItems="center"
            gap="space.03"
            textAlign="left"
            cursor="pointer"
            p="space.04"
            borderRadius="md"
            borderWidth="1px"
            borderStyle="solid"
            borderColor={selected ? 'ink.action-primary-default' : 'ink.border-default'}
            bg={selected ? 'ink.component-background-hover' : 'transparent'}
          >
            <Box flexShrink={0}>
              <ChainAvatar chain={option.id} size="md" />
            </Box>
            <Box minWidth={0}>
              <styled.div textStyle="label.02">{option.label}</styled.div>
              <styled.div
                textStyle="caption.01"
                color={isConnected ? 'green.text-secondary' : 'ink.text-subdued'}
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </styled.div>
            </Box>
          </styled.button>
        );
      })}
    </Flex>
  );
}
