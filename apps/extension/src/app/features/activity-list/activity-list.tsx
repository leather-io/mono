import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Outlet } from 'react-router';
import { Virtuoso } from 'react-virtuoso';

import { type ActivityView } from '@leather.io/features';

import { safelyFormatHexTxid } from '@app/common/utils/safe-handle-txid';
import { formatCurrency } from '@app/common/currency-formatter';
import { useActivity } from '@app/query/activity/activity.query';
import { useAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useAppDispatch } from '@app/store';
import { submittedTransactionsActions } from '@app/store/submitted-transactions/submitted-transactions.actions';
import { useSubmittedTransactions } from '@app/store/submitted-transactions/submitted-transactions.selectors';

import { ActivityItem } from './components/activity-item';
import { ActivityListLayout } from './components/activity-list.layout';
import { SubmittedTransactionList } from './components/submitted-transaction-list/submitted-transaction-list';

/*
 * Infinite scroll support is built into this component via the onLoadMore prop,
 * but it's currently not being used because the activity service API doesn't
 * support pagination. All activity is fetched at once. To enable infinite scroll:
 * 1. Update the activity service to support pagination parameters (offset/limit or cursor)
 * 2. Update the activity query config to use useInfiniteQuery instead of useQuery
 * 3. Pass the onLoadMore handler from the parent component
 */

export function ActivityList() {
  const accountIndex = useCurrentAccountIndex();
  const accountAddresses = useAccountAddresses(accountIndex);
  const submittedTransactions = useSubmittedTransactions();
  const dispatch = useAppDispatch();

  const hasSubmittedTxs = submittedTransactions.length > 0;

  const activityQuery = useActivity(accountAddresses, {
    refetchInterval: hasSubmittedTxs ? 5000 : false,
  });

  const activity = useMemo(() => activityQuery.data ?? [], [activityQuery.data]);
  const isLoading = activityQuery.isLoading;

  const activityTxIds = useMemo(
    () => new Set(activity.map(item => safelyFormatHexTxid(item.key))),
    [activity]
  );

  useEffect(() => {
    submittedTransactions.forEach(tx => {
      const normalizedTxid = safelyFormatHexTxid(tx.txid);
      if (activityTxIds.has(normalizedTxid)) {
        dispatch(submittedTransactionsActions.transactionEnteredMempool(tx.txid));
      }
    });
  }, [submittedTransactions, activityTxIds, dispatch]);

  const previousActivityLengthRef = useRef(activity.length);
  useEffect(() => {
    const currentLength = activity.length;
    const previousLength = previousActivityLengthRef.current;

    if (previousLength < currentLength && hasSubmittedTxs) {
      void activityQuery.refetch();
    }

    previousActivityLengthRef.current = currentLength;
  }, [activity.length, hasSubmittedTxs, activityQuery]);

  const visibleSubmittedTransactions = useMemo(
    () =>
      submittedTransactions.filter(tx => {
        const normalizedTxid = safelyFormatHexTxid(tx.txid);
        return !activityTxIds.has(normalizedTxid);
      }),
    [submittedTransactions, activityTxIds]
  );

  const hasSubmittedTransactions = visibleSubmittedTransactions.length > 0;
  const hasActivity = activity.length > 0 || hasSubmittedTransactions;

  const itemContent = useCallback(
    (_: number, item: ActivityView) => <ActivityItem item={item} formatCurrency={formatCurrency} />,
    []
  );

  const computeItemKey = useCallback((_: number, item: ActivityView) => item.key, []);

  return (
    <ActivityListLayout isLoading={isLoading} hasActivity={hasActivity}>
      {hasSubmittedTransactions && <SubmittedTransactionList txs={visibleSubmittedTransactions} />}
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
