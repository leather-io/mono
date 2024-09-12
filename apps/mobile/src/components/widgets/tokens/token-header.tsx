import React from 'react';

import { t } from '@lingui/macro';

import { Box, ChevronRightIcon, Chip, SheetRef, Text } from '@leather.io/ui/native';

import { FiatBalance } from '../components/balance/fiat-balance';

type Token = Record<string, unknown>;

interface TokenHeaderProps {
  tokens: Token[];
  sheetRef: React.RefObject<SheetRef>;
  totalBalance: string;
}

function TokenHeaderText() {
  return <Text variant="heading05">{t`My tokens`}</Text>;
}

export function TokenHeader({ tokens, totalBalance }: TokenHeaderProps) {
  const tokenCount = tokens.length;
  const hasTokens = tokenCount > 0;
  if (!hasTokens) return <TokenHeaderText />;
  return (
    <Box flexDirection="row" gap="1" alignItems="center" marginHorizontal="5">
      <TokenHeaderText />
      <Chip label={tokenCount} />
      <ChevronRightIcon variant="small" />
      <Box flex={1} justifyContent="flex-end" alignItems="flex-end">
        <FiatBalance balance={totalBalance} color="ink.text-subdued" />
      </Box>
    </Box>
  );
}
