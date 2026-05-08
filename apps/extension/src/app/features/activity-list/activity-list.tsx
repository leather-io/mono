import { useEffect, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Virtuoso } from 'react-virtuoso';

import {
  type ActivityView,
  type DateHeaderRow,
  insertDateHeaders,
  isDateHeaderRow,
} from '@leather.io/features';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { SbtcDepositTransactionItem } from '@app/components/sbtc-deposit-status-item/sbtc-deposit-status-item';
import { IncreaseFeeButton } from '@app/components/stacks-transaction-item/increase-fee-button';
import { StacksTransactionActionMenu } from '@app/components/stacks-transaction-item/stacks-transaction-action-menu';
import { useUserSettings } from '@app/hooks/use-user-settings';
import { useBlockchainActivity } from '@app/query/activity/blockchain-activity.query';
import { type SbtcDeposit, useSbtcPendingDeposits } from '@app/query/sbtc/sbtc-deposits.query';
import { useStacksPendingTransactions } from '@app/query/stacks/mempool/mempool.hooks';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useUpdateSubmittedTransactions } from '@app/store/submitted-transactions/submitted-transactions.hooks';
import { useSubmittedTransactions } from '@app/store/submitted-transactions/submitted-transactions.selectors';

import { ActivityDateHeader } from './components/activity-date-header';
import { ActivityItem } from './components/activity-item';
import { ActivityListLayout } from './components/activity-list.layout';
import { createSubmittedActivityViews } from './submitted-activity-view';

interface SbtcDepositRow {
  key: string;
  kind: 'sbtc-deposit';
  timestamp?: number;
  deposit: SbtcDeposit;
}

type ActivityListRow = ActivityView | SbtcDepositRow | DateHeaderRow;

function isSbtcDepositRow(item: ActivityListRow): item is SbtcDepositRow {
  return 'kind' in item && item.kind === 'sbtc-deposit';
}

function isStacksPending(item: ActivityView): boolean {
  if (item.statusIndicator !== 'pending' || !item.txid) return false;
  return !item.asset || item.asset.chain === 'stacks';
}

function isBitcoinPendingSend(item: ActivityView): boolean {
  if (item.statusIndicator !== 'pending' || !item.txid) return false;
  return item.asset?.chain === 'bitcoin' && item.statusLabel === 'Sending';
}

export function ActivityList() {
  const currentAccount = useCurrentAccountId();
  const accountAddresses = useAccountAddresses(currentAccount);
  const { network } = useUserSettings();
  const activityQuery = useBlockchainActivity(accountAddresses);
  const submittedTransactions = useSubmittedTransactions();
  const updateSubmittedTransactions = useUpdateSubmittedTransactions();
  const navigate = useNavigate();

  const stacksAddress = accountAddresses.stacks?.stxAddress ?? '';
  const { transactions: stacksPendingTransactions } = useStacksPendingTransactions(stacksAddress);

  const { pendingSbtcDeposits } = useSbtcPendingDeposits(stacksAddress);

  useEffect(() => {
    if (!stacksAddress) return;
    updateSubmittedTransactions(stacksPendingTransactions);
  }, [stacksAddress, stacksPendingTransactions, updateSubmittedTransactions]);

  const submittedActivity = createSubmittedActivityViews({ submittedTransactions, network });
  const sbtcPendingActivity: SbtcDepositRow[] = pendingSbtcDeposits.map(deposit => ({
    key: `sbtc-deposit-${deposit.bitcoinTxid}-${deposit.bitcoinTxOutputIndex}`,
    kind: 'sbtc-deposit',
    deposit,
  }));

  const flatActivity = useMemo(
    () => [...submittedActivity, ...sbtcPendingActivity, ...(activityQuery.data ?? [])],
    [submittedActivity, sbtcPendingActivity, activityQuery.data]
  );

  const activity = useMemo(() => insertDateHeaders(flatActivity), [flatActivity]);

  const hasActivity = flatActivity.length > 0;
  const isLoading = activityQuery.isLoading;
  const isFetching = activityQuery.isFetching;

  function itemContent(_: number, item: ActivityListRow) {
    if (isDateHeaderRow(item)) {
      return <ActivityDateHeader timestamp={item.timestamp} />;
    }

    if (isSbtcDepositRow(item)) {
      return <SbtcDepositTransactionItem deposit={item.deposit} />;
    }

    const txid = item.txid;
    let action: React.ReactNode | undefined;
    if (isStacksPending(item) && txid) {
      action = (
        <StacksTransactionActionMenu
          onIncreaseFee={() => navigate(RouteUrls.IncreaseStacksFee.replace(':txid', txid))}
          onCancelTransaction={() =>
            navigate(RouteUrls.CancelStacksTransaction.replace(':txid', txid))
          }
        />
      );
    } else if (isBitcoinPendingSend(item) && txid) {
      action = (
        <IncreaseFeeButton
          isEnabled
          isSelected={false}
          onIncreaseFee={() => navigate(RouteUrls.IncreaseBtcFee.replace(':txid', txid))}
        />
      );
    }

    return <ActivityItem item={item} action={action} formatCurrency={formatCurrency} />;
  }

  function computeItemKey(_: number, item: ActivityListRow) {
    return item.key;
  }

  if (activityQuery.isError) {
    return (
      <ActivityListLayout isLoading={false} hasActivity>
        <div style={{ padding: '16px', textAlign: 'center' }}>
          Unable to load activity. Please try again later.
        </div>
        <Outlet />
      </ActivityListLayout>
    );
  }

  return (
    <ActivityListLayout isLoading={isLoading} isFetching={isFetching} hasActivity={hasActivity}>
      <Virtuoso
        style={{ height: '100%' }}
        data={activity}
        itemContent={itemContent}
        computeItemKey={computeItemKey}
        overscan={200}
        useWindowScroll
      />
      <Outlet />
    </ActivityListLayout>
  );
}
