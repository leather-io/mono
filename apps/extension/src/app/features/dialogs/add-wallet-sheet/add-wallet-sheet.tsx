import type { ReactNode } from 'react';

import { Box, Circle, Flex } from 'leather-styles/jsx';

import {
  ArrowRotateClockwiseIcon,
  ItemLayout,
  LedgerIcon,
  PlusIcon,
  Pressable,
  Sheet,
  SheetHeader,
} from '@leather.io/ui';

import { MultiWalletIllustration } from '@app/features/feature-introducer/implementations/multi-wallet-illustration';

function SheetRow({
  title,
  caption,
  onClick,
  icon,
}: {
  title: string;
  caption: string;
  onClick(): void;
  icon: ReactNode;
}) {
  return (
    <Pressable my="space.03" onClick={onClick}>
      <Flex gap="space.03" px="space.05">
        <Circle
          bg="ink.background-primary"
          border="1px solid"
          borderColor="ink.border-default"
          size="48px"
        >
          {icon}
        </Circle>
        <ItemLayout titleLeft={title} captionLeft={caption} />
      </Flex>
    </Pressable>
  );
}
interface AddWalletSheetProps {
  isShowing: boolean;
  onClose(): void;
  onCreateNewWallet(): void;
  onRestoreWallet(): void;
  onConnectLedger(): void;
}

export function AddWalletSheet({
  isShowing,
  onClose,
  onCreateNewWallet,
  onRestoreWallet,
  onConnectLedger,
}: AddWalletSheetProps) {
  if (!isShowing) return null;

  return (
    <Sheet
      header={<SheetHeader title="Add wallet" />}
      isShowing={isShowing}
      onClose={onClose}
      wrapChildren={false}
    >
      <Flex flexDirection="column" width="100%">
        <Box bg="ink.background-secondary" px="space.05" py="space.07">
          <MultiWalletIllustration />
        </Box>

        <Flex flexDirection="column" gap="space.01" pb="space.05" width="100%">
          <SheetRow
            title="Create new wallet"
            caption="Create a new Bitcoin and Stacks wallet"
            icon={<PlusIcon />}
            onClick={onCreateNewWallet}
          />
          <SheetRow
            title="Restore wallet"
            caption="Import existing accounts"
            icon={<ArrowRotateClockwiseIcon />}
            onClick={onRestoreWallet}
          />
          <SheetRow
            title="Connect hardware wallet"
            caption="Connect your ledger"
            icon={<LedgerIcon />}
            onClick={onConnectLedger}
          />
        </Flex>
      </Flex>
    </Sheet>
  );
}
