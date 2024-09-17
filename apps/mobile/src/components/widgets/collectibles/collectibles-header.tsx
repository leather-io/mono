import React from 'react';

import { t } from '@lingui/macro';

import { Box, ChevronRightIcon, Chip, SheetRef, Text } from '@leather.io/ui/native';

import { FiatBalance } from '../components/balance/fiat-balance';

interface CollectiblesHeaderProps {
  collectibleCount: number;
  sheetRef: React.RefObject<SheetRef>;
  totalBalance: string;
}

function CollectiblesHeaderText() {
  return <Text variant="heading05">{t`My collectibles`}</Text>;
}

export function CollectiblesHeader({ collectibleCount, totalBalance }: CollectiblesHeaderProps) {
  const hasCollectibles = collectibleCount > 0;
  if (!hasCollectibles) return <CollectiblesHeaderText />;
  return (
    <Box flexDirection="row" gap="1" alignItems="center" marginHorizontal="5">
      <CollectiblesHeaderText />
      <Chip label={collectibleCount} />
      <ChevronRightIcon variant="small" />
      <Box flex={1} justifyContent="flex-end" alignItems="flex-end">
        <FiatBalance balance={totalBalance} color="ink.text-subdued" />
      </Box>
    </Box>
  );
}
