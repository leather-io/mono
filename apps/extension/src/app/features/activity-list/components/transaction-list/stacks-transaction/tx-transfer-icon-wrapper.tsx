import { type ReactNode } from 'react';

import { Box } from 'leather-styles/jsx';

import { AssetAvatarIcon } from '@leather.io/ui';

import { TransactionTypeIconWrapper } from '@app/components/transaction/transaction-type-icon-wrapper';

interface TxTransferIconWrapperProps {
  icon: ReactNode;
}
export function TxTransferIconWrapper({ icon }: TxTransferIconWrapperProps) {
  return (
    <Box position="relative" width="48px" height="48px" flexShrink={0}>
      <AssetAvatarIcon asset={{ protocol: 'nativeStx' }} size="xl" />
      <TransactionTypeIconWrapper icon={icon} />
    </Box>
  );
}
