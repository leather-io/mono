import { Box, Circle, Flex, styled } from 'leather-styles/jsx';

import {
  ArrowRotateClockwiseIcon,
  LedgerIcon,
  PlusIcon,
  Pressable,
  Sheet,
  SheetHeader,
} from '@leather.io/ui';

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
          <Flex justifyContent="center" alignItems="center" height="153px">
            <styled.div color="ink.text-subdued" textStyle="label.02">
              Wallet illustration
            </styled.div>
          </Flex>
        </Box>

        <Flex flexDirection="column" gap="space.01" pb="space.05" width="100%">
          <Pressable onClick={onCreateNewWallet}>
            <Flex
              alignItems="center"
              bg="ink.background-primary"
              gap="space.03"
              px="space.05"
              py="space.03"
              _hover={{ bg: 'ink.background-secondary' }}
            >
              <Circle
                bg="ink.background-primary"
                border="1px solid"
                borderColor="ink.border-default"
                size="48px"
              >
                <PlusIcon />
              </Circle>
              <Flex flexDirection="column" gap="space.01" flex={1}>
                <styled.span color="ink.text-primary" textStyle="label.02">
                  Create new wallet
                </styled.span>
                <styled.span color="ink.text-subdued" textStyle="caption">
                  Create a new Bitcoin and Stacks wallet
                </styled.span>
              </Flex>
            </Flex>
          </Pressable>

          <Pressable onClick={onRestoreWallet}>
            <Flex
              alignItems="center"
              bg="ink.background-primary"
              gap="space.03"
              px="space.05"
              py="space.03"
              _hover={{ bg: 'ink.background-secondary' }}
            >
              <Circle
                bg="ink.background-primary"
                border="1px solid"
                borderColor="ink.border-default"
                size="48px"
              >
                <ArrowRotateClockwiseIcon />
              </Circle>
              <Flex flexDirection="column" gap="space.01" flex={1}>
                <styled.span color="ink.text-primary" textStyle="label.02">
                  Restore wallet
                </styled.span>
                <styled.span color="ink.text-subdued" textStyle="caption">
                  Import existing accounts
                </styled.span>
              </Flex>
            </Flex>
          </Pressable>

          <Pressable onClick={onConnectLedger}>
            <Flex
              alignItems="center"
              bg="ink.background-primary"
              gap="space.03"
              px="space.05"
              py="space.03"
              _hover={{ bg: 'ink.background-secondary' }}
            >
              <Circle
                bg="ink.background-primary"
                border="1px solid"
                borderColor="ink.border-default"
                size="48px"
              >
                <LedgerIcon />
              </Circle>
              <Flex flexDirection="column" gap="space.01" flex={1}>
                <styled.span color="ink.text-primary" textStyle="label.02">
                  Connect hardware wallet
                </styled.span>
                <styled.span color="ink.text-subdued" textStyle="caption">
                  Connect your ledger
                </styled.span>
              </Flex>
            </Flex>
          </Pressable>
        </Flex>
      </Flex>
    </Sheet>
  );
}
