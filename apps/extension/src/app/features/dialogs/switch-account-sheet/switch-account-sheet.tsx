import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { GroupedVirtuoso } from 'react-virtuoso';

import { SwitchAccountSelectors } from '@tests/selectors/switch-account.selectors';
import { Box, Circle, Flex, styled } from 'leather-styles/jsx';

import { makeAccountIdentifer } from '@leather.io/crypto';
import type { AccountId } from '@leather.io/models';
import { Button, PlusIcon, Pressable, Sheet, SheetHeader } from '@leather.io/ui';
import { noop } from '@leather.io/utils';

import { RouteUrls } from '@shared/route-urls';

import { useCreateAccount } from '@app/common/hooks/account/use-create-account';
import { useAppDispatch } from '@app/store';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useHiddenAccountIds } from '@app/store/accounts/accounts.selectors';
import { userTogglesHideAccount } from '@app/store/accounts/accounts.slice';
import { useWalletAccountRefTree } from '@app/store/common/wallet-type.selectors';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { type PolicyStore } from '@app/store/policy/policy-store.utils';
import {
  filterPoliciesByParentAndNetwork,
  selectAllPolicies,
} from '@app/store/policy/policy.selectors';
import { VirtuosoWrapperSheet } from '@app/ui/components/virtuoso-wrapper-sheet';

import { AddWalletMenu } from '../add-wallet-menu/add-wallet-menu';
import { AccountActionMenu } from './components/account-action-menu';
import { PolicyActionMenu } from './components/policy-action-menu';
import { PolicyListItem } from './components/policy-list-item';
import { RemovePolicyDialog } from './components/remove-policy-dialog';
import { RemoveWalletDialog } from './components/remove-wallet-dialog';
import { RenameAccountDialog } from './components/rename-account-dialog';
import { RenamePolicyDialog } from './components/rename-policy-dialog';
import { RenameWalletDialog } from './components/rename-wallet-dialog';
import { SwitchAccountListItem } from './components/switch-account-list-item';
import { WalletHeader } from './components/wallet-header';
import { buildWalletRows, canHideAccount } from './switch-account-sheet.utils';
import { useAddWalletNavigation } from './use-add-wallet-navigation';

interface SwitchAccountSheetProps {
  isShowing: boolean;
  onClose(): void;
  allowPolicyAccounts?: boolean;
}

interface RenamingWallet {
  fingerprint: string;
  name: string;
}

export function SwitchAccountSheet({
  isShowing,
  onClose,
  allowPolicyAccounts = true,
}: SwitchAccountSheetProps) {
  const currentAccountId = useCurrentAccountId();
  const createAccount = useCreateAccount();
  const dispatch = useAppDispatch();
  const walletTree = useWalletAccountRefTree();
  const navigate = useNavigate();
  const hiddenAccountIds = useHiddenAccountIds();
  const isCreatingAccountRef = useRef(false);
  const [creatingFingerprint, setCreatingFingerprint] = useState<string | null>(null);
  const [isManageMode, setIsManageMode] = useState(false);
  const [renamingWallet, setRenamingWallet] = useState<RenamingWallet | null>(null);
  const [removingWallet, setRemovingWallet] = useState<RenamingWallet | null>(null);
  const [renamingAccount, setRenamingAccount] = useState<AccountId | null>(null);
  const [renamingPolicy, setRenamingPolicy] = useState<PolicyStore | null>(null);
  const [removingPolicy, setRemovingPolicy] = useState<PolicyStore | null>(null);

  const allPolicies = useSelector(selectAllPolicies);
  const network = useCurrentNetwork();

  const filteredWalletTree = useMemo(() => {
    if (isManageMode) return walletTree;
    return walletTree.map(wallet => ({
      ...wallet,
      accounts: wallet.accounts.filter(
        acc => !hiddenAccountIds.includes(makeAccountIdentifer(acc.fingerprint, acc.accountIndex))
      ),
    }));
  }, [walletTree, hiddenAccountIds, isManageMode]);

  const getPolicies = useCallback(
    (acc: AccountId) => {
      if (!allowPolicyAccounts) return [];
      const parentAccountId = makeAccountIdentifer(acc.fingerprint, acc.accountIndex);
      return filterPoliciesByParentAndNetwork(allPolicies, parentAccountId, network.id);
    },
    [allPolicies, network.id, allowPolicyAccounts]
  );

  const walletRows = useMemo(
    () => filteredWalletTree.map(wallet => buildWalletRows(wallet, getPolicies)),
    [filteredWalletTree, getPolicies]
  );

  const groupCounts = useMemo(() => walletRows.map(rows => rows.length), [walletRows]);

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
        const rowPosition = walletRows[groupIndex].findIndex(
          row =>
            row.kind === 'account' && row.accountId.accountIndex === currentAccountId.accountIndex
        );
        return globalIndex + (rowPosition === -1 ? 0 : rowPosition);
      }
      globalIndex += groupCounts[groupIndex];
    }
    return 0;
  }, [filteredWalletTree, walletRows, groupCounts, currentAccountId]);

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

  const closeSheets = useCallback(() => {
    onClose();
  }, [onClose]);

  const { onCreateNewWallet, onRestoreWallet, onConnectLedger } = useAddWalletNavigation({
    closeSheets,
  });

  function onManage() {
    setIsManageMode(prev => !prev);
  }

  function onViewSecretKey(fingerprint: string) {
    onClose();
    void navigate(RouteUrls.ViewSecretKey, {
      state: { fingerprint, startWalletAuthentication: true },
    });
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
                  <Box bg="ink.background-primary" pb="space.03" pt="space.03">
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
                const rows = walletRows[groupIndex];
                if (!wallet || !rows) return null;

                let itemsBefore = 0;
                for (let i = 0; i < groupIndex; i++) {
                  itemsBefore += groupCounts[i];
                }
                const row = rows[index - itemsBefore];
                if (!row) return null;

                if (row.kind === 'addAccount') {
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

                if (row.kind === 'policy') {
                  return (
                    <Box position="relative" pl="space.06" pr="space.05" py="space.03">
                      <PolicyListItem
                        policy={row.policy}
                        handleClose={isManageMode ? noop : onClose}
                        hideBalance={isManageMode}
                        nonInteractive={isManageMode}
                      />
                      {isManageMode && (
                        <Box
                          position="absolute"
                          top="50%"
                          right="space.04"
                          transform="translateY(-50%)"
                        >
                          <PolicyActionMenu
                            onRename={() => setRenamingPolicy(row.policy)}
                            onRemove={() => setRemovingPolicy(row.policy)}
                          />
                        </Box>
                      )}
                    </Box>
                  );
                }

                const accountId = row.accountId;
                const hidden = isAccountHidden(accountId);

                return (
                  <Box position="relative" px="space.05" py="space.03" opacity={hidden ? 0.5 : 1}>
                    <SwitchAccountListItem
                      handleClose={isManageMode ? noop : onClose}
                      accountId={accountId}
                      walletType={wallet.type}
                      hideBalance={isManageMode}
                      nonInteractive={isManageMode}
                    />
                    {isManageMode && (
                      <Box
                        position="absolute"
                        top="50%"
                        right="space.04"
                        transform="translateY(-50%)"
                      >
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
                              userTogglesHideAccount({
                                accountId: makeAccountIdentifer(
                                  accountId.fingerprint,
                                  accountId.accountIndex
                                ),
                              })
                            )
                          }
                        />
                      </Box>
                    )}
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
              <AddWalletMenu
                onCreateNewWallet={onCreateNewWallet}
                onRestoreWallet={onRestoreWallet}
                onConnectLedger={onConnectLedger}
              />
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
      {renamingPolicy && (
        <RenamePolicyDialog
          key={renamingPolicy.id}
          isShowing
          onClose={() => setRenamingPolicy(null)}
          policy={renamingPolicy}
        />
      )}
      {removingPolicy && (
        <RemovePolicyDialog
          key={removingPolicy.id}
          isShowing
          onClose={() => setRemovingPolicy(null)}
          policy={removingPolicy}
        />
      )}
    </>
  );
}
