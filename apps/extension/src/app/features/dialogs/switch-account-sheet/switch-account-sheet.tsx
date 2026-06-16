import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { GroupedVirtuoso } from 'react-virtuoso';

import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';
import { Box, Circle, Flex, styled } from 'leather-styles/jsx';

import { makeAccountIdentifer } from '@leather.io/crypto';
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
import { toggleHideAccount } from '@app/store/accounts/accounts.actions';
import { useHiddenAccountIds } from '@app/store/accounts/accounts.selectors';
import { useWalletAccountRefTree } from '@app/store/common/wallet-type.selectors';
import { VirtuosoWrapperSheet } from '@app/ui/components/virtuoso-wrapper-sheet';

import { AddWalletSheet } from '../add-wallet-sheet/add-wallet-sheet';
import { AccountActionMenu } from './components/account-action-menu';
import { RemoveWalletDialog } from './components/remove-wallet-dialog';
import { RenameAccountDialog } from './components/rename-account-dialog';
import { RenameWalletDialog } from './components/rename-wallet-dialog';
import { SwitchAccountListItem } from './components/switch-account-list-item';
import { WalletHeader } from './components/wallet-header';
import { canHideAccount } from './switch-account-sheet.utils';

interface SwitchAccountSheetProps {
  isShowing: boolean;
  onClose(): void;
}

interface RenamingWallet {
  fingerprint: string;
  name: string;
}

export function SwitchAccountSheet({ isShowing, onClose }: SwitchAccountSheetProps) {
  const currentAccountId = useCurrentAccountId();
  const createAccount = useCreateAccount();
  const dispatch = useAppDispatch();
  const walletTree = useWalletAccountRefTree();
  const navigate = useNavigate();
  const hiddenAccountIds = useHiddenAccountIds();
  const isCreatingAccountRef = useRef(false);
  const [creatingFingerprint, setCreatingFingerprint] = useState<string | null>(null);
  const [isAddWalletSheetOpen, setIsAddWalletSheetOpen] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [renamingWallet, setRenamingWallet] = useState<RenamingWallet | null>(null);
  const [removingWallet, setRemovingWallet] = useState<RenamingWallet | null>(null);
  const [renamingAccount, setRenamingAccount] = useState<AccountId | null>(null);

  const filteredWalletTree = useMemo(() => {
    if (isManageMode) return walletTree;
    return walletTree.map(wallet => ({
      ...wallet,
      accounts: wallet.accounts.filter(
        acc => !hiddenAccountIds.includes(makeAccountIdentifer(acc.fingerprint, acc.accountIndex))
      ),
    }));
  }, [walletTree, hiddenAccountIds, isManageMode]);

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
    (acc: AccountId) =>
      hiddenAccountIds.includes(makeAccountIdentifer(acc.fingerprint, acc.accountIndex)),
    [hiddenAccountIds]
  );

  const initialScrollIndex = useMemo(() => {
    let globalIndex = 0;
    for (let groupIndex = 0; groupIndex < filteredWalletTree.length; groupIndex++) {
      const wallet = filteredWalletTree[groupIndex];
      if (wallet.fingerprint === currentAccountId.fingerprint) {
        const accountPosition = wallet.accounts.findIndex(
          account => account.accountIndex === currentAccountId.accountIndex
        );
        return globalIndex + (accountPosition === -1 ? 0 : accountPosition);
      }
      globalIndex += groupCounts[groupIndex];
    }
    return 0;
  }, [filteredWalletTree, groupCounts, currentAccountId]);

  useEffect(() => {
    if (isShowing) {
      isCreatingAccountRef.current = false;
      setCreatingFingerprint(null);
    }
  }, [isShowing]);

  function onCreateAccount(fingerprint: string) {
    if (isCreatingAccountRef.current) return;
    isCreatingAccountRef.current = true;
    setCreatingFingerprint(fingerprint);
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
  }

  function onRestoreWallet() {
    onClose();
    setIsAddWalletSheetOpen(false);
    void navigate(RouteUrls.AddWallet);
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

  const onSelectConnectLedger = useCallback(() => {
    if (doesBrowserSupportWebUsbApi()) {
      return supportsWebUsbAction();
    } else {
      return doesNotSupportWebUsbAction();
    }
  }, [doesNotSupportWebUsbAction, supportsWebUsbAction]);

  function onManage() {
    setIsManageMode(prev => !prev);
  }

  function onViewSecretKey(fingerprint: string) {
    onClose();
    void navigate(RouteUrls.ViewSecretKey, { state: { fingerprint } });
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
                      walletType={wallet.type}
                      canRemoveWallet={walletTree.length > 1}
                      onRename={() =>
                        setRenamingWallet({
                          fingerprint: wallet.fingerprint,
                          name: wallet.name,
                        })
                      }
                      onRemove={() =>
                        setRemovingWallet({
                          fingerprint: wallet.fingerprint,
                          name: wallet.name,
                        })
                      }
                      onViewSecretKey={() => onViewSecretKey(wallet.fingerprint)}
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
                  const isCreating = creatingFingerprint === wallet.fingerprint;
                  return (
                    <Box px="space.05" py="space.03">
                      <Pressable
                        onClick={() => onCreateAccount(wallet.fingerprint)}
                        disabled={isCreating}
                        aria-busy={isCreating}
                        data-testid={SwitchAccountSelectors.CreateAccountBtn}
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
                        <Box minWidth={0} flex="1" pointerEvents="none">
                          <SwitchAccountListItem
                            handleClose={noop}
                            accountId={accountId}
                            walletType={wallet.type}
                          />
                        </Box>
                        <AccountActionMenu
                          isHidden={hidden}
                          canHide={canHideAccount({
                            account: accountId,
                            activeAccount: currentAccountId,
                            walletAccounts: wallet.accounts,
                            hiddenAccountIds,
                          })}
                          onRename={() => setRenamingAccount(accountId)}
                          onHide={() =>
                            dispatch(
                              toggleHideAccount(
                                makeAccountIdentifer(accountId.fingerprint, accountId.accountIndex)
                              )
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
      {renamingWallet && (
        <RenameWalletDialog
          isShowing
          onClose={() => setRenamingWallet(null)}
          fingerprint={renamingWallet.fingerprint}
          currentName={renamingWallet.name}
        />
      )}
      {removingWallet && (
        <RemoveWalletDialog
          isShowing
          onClose={() => setRemovingWallet(null)}
          fingerprint={removingWallet.fingerprint}
          currentName={removingWallet.name}
        />
      )}
      {renamingAccount && (
        <RenameAccountDialog
          key={makeAccountIdentifer(renamingAccount.fingerprint, renamingAccount.accountIndex)}
          isShowing
          onClose={() => setRenamingAccount(null)}
          accountId={renamingAccount}
        />
      )}
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
