import { Box, Circle, Flex, styled } from 'leather-styles/jsx';

import { ChainGlyph } from '../../components/chain-glyph';
import type { Chain } from '../../data/multisig-types';

interface ChainPickerProps {
  chain: Chain;
  onChange(chain: Chain): void;
}

const chains: { id: Chain; label: string }[] = [
  { id: 'btc', label: 'Bitcoin multisig' },
  { id: 'stx', label: 'Stacks multisig' },
];

export function ChainPicker({ chain, onChange }: ChainPickerProps) {
  return (
    <Flex gap="space.03">
      {chains.map(option => {
        const selected = chain === option.id;
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
            <Circle size="32px" bg="ink.background-secondary" flexShrink={0}>
              <ChainGlyph chain={option.id} variant="small" />
            </Circle>
            <Box minWidth={0}>
              <styled.div textStyle="label.02">{option.label}</styled.div>
            </Box>
          </styled.button>
        );
      })}
    </Flex>
  );
}
