import { useEffect, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { Virtuoso } from 'react-virtuoso';

import { type ActivityView } from '@leather.io/features';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { SbtcDepositTransactionItem } from '@app/components/sbtc-deposit-status-item/sbtc-deposit-status-item';
import { IncreaseFeeButton } from '@app/components/stacks-transaction-item/increase-fee-button';
import { StacksTransactionActionMenu } from '@app/components/stacks-transaction-item/stacks-transaction-action-menu';
import { useUserSettings } from '@app/hooks/use-user-settings';
import { useActivity } from '@app/query/activity/activity.query';
import { type SbtcDeposit, useSbtcPendingDeposits } from '@app/query/sbtc/sbtc-deposits.query';
import { useStacksPendingTransactions } from '@app/query/stacks/mempool/mempool.hooks';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useUpdateSubmittedTransactions } from '@app/store/submitted-transactions/submitted-transactions.hooks';
import { useSubmittedTransactions } from '@app/store/submitted-transactions/submitted-transactions.selectors';

import { ActivityDateHeader, getDateGroupKey } from './components/activity-date-header';
import { ActivityItem } from './components/activity-item';
import { ActivityListLayout } from './components/activity-list.layout';
import { createSubmittedActivityViews } from './submitted-activity-view';

type SbtcDepositRow = {
  key: string;
  kind: 'sbtc-deposit';
  timestamp?: number;
  deposit: SbtcDeposit;
};

type DateHeaderRow = {
  key: string;
  kind: 'date-header';
  timestamp: number;
};

type ActivityListRow = ActivityView | SbtcDepositRow | DateHeaderRow;

function isSbtcDepositRow(item: ActivityListRow): item is SbtcDepositRow {
  return 'kind' in item && item.kind === 'sbtc-deposit';
}

function isDateHeaderRow(item: ActivityListRow): item is DateHeaderRow {
  return 'kind' in item && item.kind === 'date-header';
}

function isStacksPending(item: ActivityView): boolean {
  if (item.statusIndicator !== 'pending' || !item.txid) return false;
  return !item.asset || item.asset.chain === 'stacks';
}

function isBitcoinPendingSend(item: ActivityView): boolean {
  if (item.statusIndicator !== 'pending' || !item.txid) return false;
  return item.asset?.chain === 'bitcoin' && item.statusLabel === 'Sending';
}

function insertDateHeaders(items: (ActivityView | SbtcDepositRow)[]): ActivityListRow[] {
  const result: ActivityListRow[] = [];
  let lastDateKey = '';

  for (const item of items) {
    const ts = item.timestamp;
    if (ts) {
      const dateKey = getDateGroupKey(ts);
      if (dateKey !== lastDateKey) {
        lastDateKey = dateKey;
        result.push({ key: `date-${dateKey}`, kind: 'date-header', timestamp: ts });
      }
    }
    result.push(item);
  }

  return result;
}

export function ActivityList() {
  const accountIndex = useCurrentAccountIndex();
  const accountAddresses = useAccountAddresses(accountIndex);
  const { network } = useUserSettings();
  const activityQuery = useActivity(accountAddresses);
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

  const historicalActivity = activityQuery.data ?? [];
  const submittedActivity = createSubmittedActivityViews({ submittedTransactions, network });
  const sbtcPendingActivity: SbtcDepositRow[] = pendingSbtcDeposits.map(deposit => ({
    key: `sbtc-deposit-${deposit.bitcoinTxid}-${deposit.bitcoinTxOutputIndex}`,
    kind: 'sbtc-deposit',
    deposit,
  }));

  const flatActivity: (ActivityView | SbtcDepositRow)[] = [
    ...submittedActivity,
    ...sbtcPendingActivity,
    ...historicalActivity,
  ];

  const activity = useMemo(() => insertDateHeaders(flatActivity), [flatActivity]);

  const hasActivity = flatActivity.length > 0;
  const isLoading = activityQuery.isLoading;

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
    <ActivityListLayout isLoading={isLoading} hasActivity={hasActivity}>
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
