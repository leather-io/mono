import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { GroupedVirtuoso } from 'react-virtuoso';

import { getRecipientSelectAccountTestId } from '@tests/selectors/send.selectors';
import { Box } from 'leather-styles/jsx';

import { Sheet, SheetHeader } from '@leather.io/ui';

import { WalletHeader } from '@app/features/dialogs/switch-account-sheet/components/wallet-header';
import { useHiddenAccountIds } from '@app/store/accounts/accounts.selectors';
import { useWalletAccountRefTree } from '@app/store/common/wallet-type.selectors';
import { VirtuosoWrapperSheet } from '@app/ui/components/virtuoso-wrapper-sheet';

import { AccountListItem } from './account-list-item';
import { getAccountAt, getVisibleWalletAccountGroups } from './recipient-accounts-dialog.utils';

export function RecipientAccountsSheet() {
  const navigate = useNavigate();
  const walletTree = useWalletAccountRefTree();
  const hiddenAccountIds = useHiddenAccountIds();

  const onGoBack = useCallback(() => navigate('..', { replace: true }), [navigate]);

  const { groups, groupCounts } = useMemo(
    () => getVisibleWalletAccountGroups(walletTree, hiddenAccountIds),
    [walletTree, hiddenAccountIds]
  );

  if (groups.length === 0) return null;

  return (
    <Sheet
      header={<SheetHeader title="Select account" />}
      isShowing
      onClose={onGoBack}
      wrapChildren={false}
    >
      <VirtuosoWrapperSheet>
        <GroupedVirtuoso
          groupCounts={groupCounts}
          groupContent={groupIndex => {
            const wallet = groups[groupIndex];
            if (!wallet) return null;
            return (
              <Box
                bg="ink.background-primary"
                pb="space.03"
                pt={groupIndex === 0 ? 'space.01' : 'space.05'}
              >
                <WalletHeader isManageMode={false} name={wallet.name} walletType={wallet.type} />
              </Box>
            );
          }}
          itemContent={(index, groupIndex) => {
            const wallet = groups[groupIndex];
            const accountId = getAccountAt(groups, groupCounts, index);
            if (!wallet || !accountId) return null;
            return (
              <Box
                data-testid={getRecipientSelectAccountTestId(
                  accountId.fingerprint,
                  accountId.accountIndex
                )}
                px="space.05"
                py="space.03"
              >
                <AccountListItem accountId={accountId} onClose={onGoBack} />
              </Box>
            );
          }}
        />
      </VirtuosoWrapperSheet>
    </Sheet>
  );
}
