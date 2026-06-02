import type { ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

import type { Chain } from '../data/multisig-types';
import { ChainGlyph } from './chain-glyph';

interface ChainPillProps {
  chain: Chain;
  // logo-only: render just the chain mark, no label.
  logo?: boolean;
  suffix?: ReactNode;
}

export function ChainPill({ chain, logo, suffix }: ChainPillProps) {
  const label = chain === 'btc' ? 'Bitcoin' : 'Stacks';
  return (
    <Flex
      alignItems="center"
      gap="space.01"
      width="fit-content"
      px="space.02"
      py="2px"
      borderRadius="round"
      bg="ink.background-secondary"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-transparent"
      textStyle="label.03"
      color="ink.text-subdued"
    >
      <ChainGlyph chain={chain} variant="small" />
      {!logo && <styled.span>{label}</styled.span>}
      {suffix}
    </Flex>
  );
}
