import { useLocation, useNavigate } from 'react-router';

import { Flex } from 'leather-styles/jsx';

import type { BlockchainActivityItem } from '@leather.io/features';

import { RouteUrls } from '@shared/route-urls';

import { useStacksTransactionActionNavigate } from '@app/common/hooks/use-stacks-transaction-action-navigate';
import { StacksTransactionActionType } from '@app/common/transactions/stacks/transaction.utils';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { DetailsPillButton } from '@app/components/details/details-pill-button';
import { usePendingBitcoinTxByTxid } from '@app/query/bitcoin/address/transactions-by-address.hooks';

import { getActivityActionKind } from '../activity-list/components/activity-row-actions';

interface PendingActionsProps {
  txid: string;
}

function StacksPendingActions({ txid }: PendingActionsProps) {
  const navigateToTransactionAction = useStacksTransactionActionNavigate();
  return (
    <>
      <DetailsPillButton
        label="Increase fee"
        onClick={() => navigateToTransactionAction(txid, StacksTransactionActionType.IncreaseFee)}
      />
      <DetailsPillButton
        label="Cancel"
        onClick={() => navigateToTransactionAction(txid, StacksTransactionActionType.Cancel)}
      />
    </>
  );
}

function BitcoinPendingActions({ txid }: PendingActionsProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pendingTx = usePendingBitcoinTxByTxid(txid);
  if (!pendingTx) return null;
  return (
    <DetailsPillButton
      label="Increase fee"
      onClick={() =>
        void navigate(RouteUrls.IncreaseBtcFee, {
          state: { btcTx: pendingTx, returnTo: pathname },
        })
      }
    />
  );
}

interface ActivityDetailsActionsProps {
  item: BlockchainActivityItem;
  reclaimUrl?: string;
}

export function ActivityDetailsActions({ item, reclaimUrl }: ActivityDetailsActionsProps) {
  const { activity, view } = item;
  const actionKind = getActivityActionKind(activity);
  if (!reclaimUrl && actionKind === null) return null;

  return (
    <Flex
      gap="space.02"
      alignItems="center"
      justifyContent="center"
      flexWrap="nowrap"
      px="space.05"
      py="space.01"
      width="100%"
      maxWidth="390px"
      margin="0 auto"
    >
      {reclaimUrl ? (
        <DetailsPillButton label="Reclaim" onClick={() => openInNewTab(reclaimUrl)} />
      ) : null}
      {actionKind === 'stacks-manage' ? <StacksPendingActions txid={view.txid} /> : null}
      {actionKind === 'bitcoin-increase-fee' ? <BitcoinPendingActions txid={view.txid} /> : null}
    </Flex>
  );
}
