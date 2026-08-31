import { useLocation, useMatch, useNavigate } from 'react-router';

import type { BlockchainActivity } from '@leather.io/models';

import { RouteUrls } from '@shared/route-urls';

import { useStacksTransactionActionNavigate } from '@app/common/hooks/use-stacks-transaction-action-navigate';
import { StacksTransactionActionType } from '@app/common/transactions/stacks/transaction.utils';
import { IncreaseFeeButton } from '@app/components/stacks-transaction-item/increase-fee-button';
import { StacksTransactionActionMenu } from '@app/components/stacks-transaction-item/stacks-transaction-action-menu';
import { usePendingBitcoinTxByTxid } from '@app/query/bitcoin/address/transactions-by-address.hooks';

type ActivityActionKind = 'stacks-manage' | 'bitcoin-increase-fee';

export function getActivityActionKind(activity: BlockchainActivity): ActivityActionKind | null {
  if (activity.status !== 'pending' || !activity.initiatedByUser) return null;
  return activity.chain === 'stacks' ? 'stacks-manage' : 'bitcoin-increase-fee';
}

interface ActivityActionProps {
  txid: string;
}

function StacksActivityAction({ txid }: ActivityActionProps) {
  const navigateToTransactionAction = useStacksTransactionActionNavigate();
  const cancelTransactionMatch = useMatch(RouteUrls.CancelStacksTransaction);
  const increaseFeeMatch = useMatch(RouteUrls.IncreaseStacksFee);

  if (cancelTransactionMatch || increaseFeeMatch) return null;

  return (
    <StacksTransactionActionMenu
      onIncreaseFee={() =>
        navigateToTransactionAction(txid, StacksTransactionActionType.IncreaseFee)
      }
      onCancelTransaction={() =>
        navigateToTransactionAction(txid, StacksTransactionActionType.Cancel)
      }
    />
  );
}

function BitcoinActivityAction({ txid }: ActivityActionProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pendingTx = usePendingBitcoinTxByTxid(txid);

  // The RBF flow needs the esplora shape (vin.sequence, prevout scripts, fee),
  // which the internal BitcoinTransaction model does not carry.
  if (!pendingTx) return null;

  return (
    <IncreaseFeeButton
      isEnabled
      isSelected={pathname === RouteUrls.IncreaseBtcFee}
      onIncreaseFee={() => void navigate(RouteUrls.IncreaseBtcFee, { state: { btcTx: pendingTx } })}
    />
  );
}

interface ActivityRowActionsProps {
  kind: ActivityActionKind;
  txid: string;
}

export function ActivityRowActions({ kind, txid }: ActivityRowActionsProps) {
  if (kind === 'stacks-manage') return <StacksActivityAction txid={txid} />;
  return <BitcoinActivityAction txid={txid} />;
}
