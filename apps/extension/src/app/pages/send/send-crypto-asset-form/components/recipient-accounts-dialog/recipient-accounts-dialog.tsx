import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { GroupedVirtuoso } from 'react-virtuoso';

import {
  getRecipientSelectAccountTestId,
  getRecipientSelectPolicyTestId,
} from '@tests/selectors/send.selectors';
import { useFormikContext } from 'formik';
import { Box } from 'leather-styles/jsx';

import { Sheet, SheetHeader } from '@leather.io/ui';

import { BitcoinSendFormValues, StacksSendFormValues } from '@shared/models/form.model';

import { WalletHeader } from '@app/features/dialogs/switch-account-sheet/components/wallet-header';
import { useHiddenAccountIds } from '@app/store/accounts/accounts.selectors';
import { useWalletAccountRefTree } from '@app/store/common/wallet-type.selectors';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { selectAllPolicies } from '@app/store/policy/policy.selectors';
import { VirtuosoWrapperSheet } from '@app/ui/components/virtuoso-wrapper-sheet';

import { AccountListItem } from './account-list-item';
import { PolicyListItem } from './policy-list-item';
import {
  buildRecipientRows,
  getRecipientPolicies,
  getRowAt,
  getVisibleWalletAccountGroups,
} from './recipient-accounts-dialog.utils';

export function RecipientAccountsSheet() {
  const navigate = useNavigate();
  const walletTree = useWalletAccountRefTree();
  const hiddenAccountIds = useHiddenAccountIds();
  const allPolicies = useSelector(selectAllPolicies);
  const network = useCurrentNetwork();
  const { values } = useFormikContext<BitcoinSendFormValues | StacksSendFormValues>();

  const onGoBack = useCallback(() => navigate('..', { replace: true }), [navigate]);

  const { groups } = useMemo(
    () => getVisibleWalletAccountGroups(walletTree, hiddenAccountIds),
    [walletTree, hiddenAccountIds]
  );

  const chain = values.symbol === 'BTC' ? 'bitcoin' : 'stacks';

  const rowGroups = useMemo(
    () =>
      groups.map(wallet =>
        buildRecipientRows(wallet, account =>
          getRecipientPolicies(allPolicies, account, network.id, chain)
        )
      ),
    [groups, allPolicies, network.id, chain]
  );

  const groupCounts = useMemo(() => rowGroups.map(rows => rows.length), [rowGroups]);

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
            const row = getRowAt(rowGroups, index);
            if (!wallet || !row) return null;

            if (row.kind === 'policy') {
              return (
                <Box
                  data-testid={getRecipientSelectPolicyTestId(row.policy.id)}
                  pl="space.06"
                  pr="space.05"
                  py="space.03"
                >
                  <PolicyListItem policy={row.policy} onClose={onGoBack} />
                </Box>
              );
            }

            return (
              <Box
                data-testid={getRecipientSelectAccountTestId(
                  row.accountId.fingerprint,
                  row.accountId.accountIndex
                )}
                px="space.05"
                py="space.03"
              >
                <AccountListItem
                  accountId={row.accountId}
                  walletType={wallet.type}
                  onClose={onGoBack}
                />
              </Box>
            );
          }}
        />
      </VirtuosoWrapperSheet>
    </Sheet>
  );
}
