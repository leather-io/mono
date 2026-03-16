import { useMemo, useState } from 'react';
import { GroupedVirtuoso } from 'react-virtuoso';

import { Box, Circle, Flex, styled } from 'leather-styles/jsx';

import { Button, PlusIcon, Pressable, Sheet, SheetHeader, WalletPlusIcon } from '@leather.io/ui';

import { useCreateAccount } from '@app/common/hooks/account/use-create-account';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useWalletAccountRefTree } from '@app/store/common/wallet-type.selectors';
import { VirtuosoWrapperSheet } from '@app/ui/components/virtuoso-wrapper-sheet';

import { AddWalletSheet } from '../add-wallet-sheet/add-wallet-sheet';
import { SwitchAccountListItem } from './components/switch-account-list-item';
import { WalletHeader } from './components/wallet-header';

interface SwitchAccountSheetProps {
  isShowing: boolean;
  onClose(): void;
}

export function SwitchAccountSheet({ isShowing, onClose }: SwitchAccountSheetProps) {
  const currentAccountId = useCurrentAccountId();
  const createAccount = useCreateAccount();
  const walletTree = useWalletAccountRefTree();
  const [isAddWalletSheetOpen, setIsAddWalletSheetOpen] = useState(false);

  const groupCounts = useMemo(() => {
    return walletTree.map(wallet => {
      let count = wallet.accounts.length;
      if (wallet.type === 'software') {
        count += 1;
      }
      return count;
    });
  }, [walletTree]);

  const initialScrollIndex = useMemo(() => {
    let globalIndex = 0;
    for (let groupIndex = 0; groupIndex < walletTree.length; groupIndex++) {
      const wallet = walletTree[groupIndex];
      if (wallet.fingerprint === currentAccountId.fingerprint) {
        return globalIndex + currentAccountId.accountIndex;
      }
      globalIndex += groupCounts[groupIndex];
    }
    return 0;
  }, [walletTree, groupCounts, currentAccountId]);

  function onCreateAccount() {
    setIsCreatingAccount(true);
    requestIdleCallback(async () => {
      await createAccount();
      onClose();
    });
  }

  function onAddWallet() {
    setIsAddWalletSheetOpen(true);
  }

  function onCloseAddWalletSheet() {
    setIsAddWalletSheetOpen(false);
  }

  function onCreateNewWallet() {
    setIsAddWalletSheetOpen(false);
    // TODO: Navigate to create new wallet flow
  }

  function onRestoreWallet() {
    setIsAddWalletSheetOpen(false);
    // TODO: Navigate to restore wallet flow
  }

  function onConnectLedger() {
    setIsAddWalletSheetOpen(false);
    // TODO: Navigate to connect ledger flow
  }

  function onManage() {
    // Placeholder for manage functionality
  }

  if (!isShowing) return null;

  return (
    <>
      <Sheet
        header={<SheetHeader title="Select account" />}
        isShowing={isShowing}
        onClose={onClose}
        wrapChildren={false}
      >
        <VirtuosoWrapperSheet>
          <Box flex="1">
            <GroupedVirtuoso
              groupCounts={groupCounts}
              groupContent={groupIndex => {
                const wallet = walletTree[groupIndex];
                if (!wallet) return null;

                return (
                  <Box
                    bg="ink.background-primary"
                    pb="space.03"
                    pt={groupIndex === 0 ? 'space.01' : 'space.05'}
                  >
                    <WalletHeader name={wallet.name} />
                  </Box>
                );
              }}
              initialTopMostItemIndex={initialScrollIndex !== -1 ? initialScrollIndex : 0}
              itemContent={(index, groupIndex) => {
                const wallet = walletTree[groupIndex];
                if (!wallet) return null;

                // Calculate local index within this group
                let itemsBefore = 0;
                for (let i = 0; i < groupIndex; i++) {
                  itemsBefore += groupCounts[i];
                }
                const localIndex = index - itemsBefore;

                const accountCount = wallet.accounts.length;
                const isAddAccountButton = localIndex >= accountCount;

                if (isAddAccountButton) {
                  return (
                    <Box px="space.05" py="space.03">
                      <Pressable onClick={onCreateAccount} data-testid="create-account-btn">
                        <Flex alignItems="center" gap="space.03">
                          <Circle bg="ink.background-secondary" size="48px">
                            <PlusIcon />
                          </Circle>
                          <styled.span color="ink.text-primary" textStyle="label.01">
                            Add account
                          </styled.span>
                        </Flex>
                      </Pressable>
                    </Box>
                  );
                }

                const accountId = wallet.accounts[localIndex];
                if (!accountId) return null;

                return (
                  <Box px="space.05" py="space.03">
                    <SwitchAccountListItem
                      handleClose={onClose}
                      accountId={accountId}
                      walletType={wallet.type}
                    />
                  </Box>
                );
              }}
            />
          </Box>
          <Box flexShrink={0} width="100%">
            <Flex
              bg="ink.background-primary"
              borderBottomRadius="md"
              boxShadow="contentOverflowFade"
              flexDirection="row"
              gap="space.04"
              minWidth={0}
              p="space.05"
            >
              <Button
                onClick={onAddWallet}
                variant="outline"
                flex={1}
                iconStart={<WalletPlusIcon />}
              >
                Add wallet
              </Button>
              <Button onClick={onManage} variant="outline" flex={1}>
                Manage
              </Button>
            </Flex>
          </Box>
        </VirtuosoWrapperSheet>
      </Sheet>
      <AddWalletSheet
        isShowing={isAddWalletSheetOpen}
        onClose={onCloseAddWalletSheet}
        onCreateNewWallet={onCreateNewWallet}
        onRestoreWallet={onRestoreWallet}
        onConnectLedger={onConnectLedger}
      />
    </>
  );
}
