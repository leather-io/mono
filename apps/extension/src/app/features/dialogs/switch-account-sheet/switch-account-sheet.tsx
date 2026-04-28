import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { GroupedVirtuoso } from 'react-virtuoso';

import { Box, Circle, Flex, styled } from 'leather-styles/jsx';

import type { AccountId } from '@leather.io/models';
import { Button, PlusIcon, Pressable, Sheet, SheetHeader, WalletPlusIcon } from '@leather.io/ui';
import { noop } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { useCreateAccount } from '@app/common/hooks/account/use-create-account';
import { doesBrowserSupportWebUsbApi, whenPageMode } from '@app/common/utils';
import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';
import { useAppDispatch } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useWalletAccountRefTree } from '@app/store/common/wallet-type.selectors';
import { selectHiddenAccounts } from '@app/store/settings/account-settings.selectors';
import { settingsSlice } from '@app/store/settings/settings.slice';
import { VirtuosoWrapperSheet } from '@app/ui/components/virtuoso-wrapper-sheet';

import { AddWalletSheet } from '../add-wallet-sheet/add-wallet-sheet';
import { AccountActionMenu } from './components/account-action-menu';
import { RenameAccountDialog } from './components/rename-account-dialog';
import { RenameWalletDialog } from './components/rename-wallet-dialog';
import { SwitchAccountListItem } from './components/switch-account-list-item';
import { WalletHeader } from './components/wallet-header';

interface SwitchAccountSheetProps {
  isShowing: boolean;
  onClose(): void;
}

interface RenamingWallet {
  fingerprint: string;
  name: string;
}

interface RenamingAccount {
  accountId: AccountId;
  name: string;
}

function accountKey(fingerprint: string, accountIndex: number) {
  return `${fingerprint}:${accountIndex}`;
}

export function SwitchAccountSheet({ isShowing, onClose }: SwitchAccountSheetProps) {
  const currentAccountId = useCurrentAccountId();
  const createAccount = useCreateAccount();
  const dispatch = useAppDispatch();
  const walletTree = useWalletAccountRefTree();
  const navigate = useNavigate();
  const hiddenAccounts = useSelector(selectHiddenAccounts);
  const [isAddWalletSheetOpen, setIsAddWalletSheetOpen] = useState(false);
  const [_isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [renamingWallet, setRenamingWallet] = useState<RenamingWallet | null>(null);
  const [renamingAccount, setRenamingAccount] = useState<RenamingAccount | null>(null);

  const filteredWalletTree = useMemo(() => {
    if (isManageMode) return walletTree;
    return walletTree.map(wallet => ({
      ...wallet,
      accounts: wallet.accounts.filter(
        acc => !hiddenAccounts.includes(accountKey(acc.fingerprint, acc.accountIndex))
      ),
    }));
  }, [walletTree, hiddenAccounts, isManageMode]);

  const groupCounts = useMemo(() => {
    return filteredWalletTree.map(wallet => {
      let count = wallet.accounts.length;
      if (wallet.type === 'software' && !isManageMode) {
        count += 1;
      }
      return count;
    });
  }, [filteredWalletTree, isManageMode]);

  const isAccountHidden = useCallback(
    (acc: AccountId) => hiddenAccounts.includes(accountKey(acc.fingerprint, acc.accountIndex)),
    [hiddenAccounts]
  );

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

  function onCreateAccount(fingerprint: string) {
    setIsCreatingAccount(true);
    requestIdleCallback(async () => {
      await createAccount(fingerprint);
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
    onClose();
    setIsAddWalletSheetOpen(false);
    void navigate(RouteUrls.CreateWallet);
    // TODO: Navigate to create new wallet flow
  }

  function onRestoreWallet() {
    onClose();
    setIsAddWalletSheetOpen(false);
    void navigate(RouteUrls.AddWallet);
    // TODO: Navigate to restore wallet flow
  }

  function pageModeRoutingAction(url: string) {
    return whenPageMode({
      full() {
        return navigate(url);
      },
      popup() {
        void openIndexPageInNewTab(url);
        closeWindow();
      },
    });
  }

  const supportsWebUsbAction = pageModeRoutingAction(RouteUrls.ConnectLedgerStart);
  const doesNotSupportWebUsbAction = pageModeRoutingAction(RouteUrls.LedgerUnsupportedBrowser);

  const onSelectConnectLedger = useCallback(async () => {
    if (doesBrowserSupportWebUsbApi()) {
      return supportsWebUsbAction();
    } else {
      return doesNotSupportWebUsbAction();
    }
  }, [doesNotSupportWebUsbAction, supportsWebUsbAction]);

  function onManage() {
    setIsManageMode(prev => !prev);
  }

  if (!isShowing) return null;

  return (
    <>
      <Sheet
        header={<SheetHeader title={isManageMode ? 'Manage wallets' : 'Select account'} />}
        isShowing={isShowing}
        onClose={onClose}
        wrapChildren={false}
      >
        <VirtuosoWrapperSheet>
          <Box flex="1">
            <GroupedVirtuoso
              groupCounts={groupCounts}
              groupContent={groupIndex => {
                const wallet = filteredWalletTree[groupIndex];
                if (!wallet) return null;

                return (
                  <Box
                    bg="ink.background-primary"
                    pb="space.03"
                    pt={groupIndex === 0 ? 'space.01' : 'space.05'}
                  >
                    <WalletHeader
                      isManageMode={isManageMode}
                      name={wallet.name}
                      onRename={() =>
                        setRenamingWallet({
                          fingerprint: wallet.fingerprint,
                          name: wallet.name,
                        })
                      }
                    />
                  </Box>
                );
              }}
              initialTopMostItemIndex={initialScrollIndex !== -1 ? initialScrollIndex : 0}
              itemContent={(index, groupIndex) => {
                const wallet = filteredWalletTree[groupIndex];
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
                      <Pressable
                        onClick={() => onCreateAccount(wallet.fingerprint)}
                        data-testid="create-account-btn"
                      >
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

                const hidden = isAccountHidden(accountId);

                if (isManageMode) {
                  return (
                    <Box px="space.05" py="space.03" opacity={hidden ? 0.5 : 1}>
                      <Flex alignItems="center" gap="space.02">
                        <Box flex="1" pointerEvents="none">
                          <SwitchAccountListItem
                            handleClose={noop}
                            accountId={accountId}
                            walletType={wallet.type}
                          />
                        </Box>
                        <AccountActionMenu
                          isHidden={hidden}
                          onRename={() => setRenamingAccount({ accountId, name: '' })}
                          onHide={() =>
                            dispatch(
                              settingsSlice.actions.toggleAccountHidden({
                                fingerprint: accountId.fingerprint,
                                accountIndex: accountId.accountIndex,
                              })
                            )
                          }
                        />
                      </Flex>
                    </Box>
                  );
                }

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
                {isManageMode ? 'Done' : 'Manage'}
              </Button>
            </Flex>
          </Box>
        </VirtuosoWrapperSheet>
      </Sheet>
      <RenameWalletDialog
        isShowing={renamingWallet !== null}
        onClose={() => setRenamingWallet(null)}
        fingerprint={renamingWallet?.fingerprint ?? ''}
        currentName={renamingWallet?.name ?? ''}
      />
      <RenameAccountDialog
        isShowing={renamingAccount !== null}
        onClose={() => setRenamingAccount(null)}
        accountId={renamingAccount?.accountId ?? { fingerprint: '', accountIndex: 0 }}
        currentName={renamingAccount?.name ?? ''}
      />
      <AddWalletSheet
        isShowing={isAddWalletSheetOpen}
        onClose={onCloseAddWalletSheet}
        onCreateNewWallet={onCreateNewWallet}
        onRestoreWallet={onRestoreWallet}
        onConnectLedger={onSelectConnectLedger}
      />
    </>
  );
}
