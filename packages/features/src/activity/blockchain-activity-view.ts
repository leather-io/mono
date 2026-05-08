import { stxAsset } from '@leather.io/constants';
import {
  type BlockchainActivity,
  type BlockchainActivityEvent,
  type CryptoAsset,
  type NetworkConfiguration,
  type OnChainActivityStatus,
  isFungibleAsset,
} from '@leather.io/models';
import { minusSign, truncateMiddle } from '@leather.io/utils';

import { makeActivityLink } from './activity-links';
import type {
  ActivityAvatar,
  ActivityBalances,
  ActivityStatusIndicatorId,
  ActivityView,
} from './types';

function getFirstEvent(activity: BlockchainActivity) {
  return activity.events[0];
}

function getAsset(activity: BlockchainActivity): CryptoAsset | undefined {
  const event = getFirstEvent(activity);
  if (event) return event.asset;
  if (activity.contract) return stxAsset;
  return undefined;
}

function getContractName(contractId: string): string {
  return contractId.split('.').pop() ?? contractId;
}

function getDeployTitle(status: OnChainActivityStatus): string {
  switch (status) {
    case 'pending':
      return 'Deploying';
    case 'success':
      return 'Deployed';
    case 'failed':
      return 'Deploy failed';
    default:
      return 'Deploy';
  }
}

function getTitle(activity: BlockchainActivity): string {
  if (activity.contract?.type === 'call') return activity.contract.functionName;
  if (activity.contract?.type === 'deploy') return getDeployTitle(activity.status);

  const event = getFirstEvent(activity);
  if (event && isFungibleAsset(event.asset)) return event.asset.symbol;
  if (event) return 'Token Transfer';

  return 'Unknown';
}

function getEventCaption(event: BlockchainActivityEvent, status: OnChainActivityStatus): string {
  const truncated = event.counterparty ? truncateMiddle(event.counterparty, 4) : '';

  switch (event.action) {
    case 'sent':
      switch (status) {
        case 'pending':
          return truncated ? `Sending to ${truncated}` : 'Sending';
        case 'success':
          return truncated ? `Sent to ${truncated}` : 'Sent';
        case 'failed':
          return truncated ? `Send failed to ${truncated}` : 'Send failed';
        default:
          return 'Send';
      }
    case 'received':
      switch (status) {
        case 'pending':
          return truncated ? `Receiving from ${truncated}` : 'Receiving';
        case 'success':
          return truncated ? `Received from ${truncated}` : 'Received';
        case 'failed':
          return 'Receive failed';
        default:
          return 'Receive';
      }
    case 'locked':
      return status === 'pending' ? 'Locking' : 'Locked';
    case 'minted':
      return status === 'pending' ? 'Minting' : 'Minted';
    case 'burned':
      return status === 'pending' ? 'Burning' : 'Burned';
    default:
      return '';
  }
}

function getCaption(activity: BlockchainActivity): string {
  if (activity.contract) return getContractName(activity.contract.contractId);

  const event = getFirstEvent(activity);
  if (event) return getEventCaption(event, activity.status);

  return '';
}

function getStatusLabel(activity: BlockchainActivity): string | null {
  if (activity.contract) return getContractName(activity.contract.contractId);

  const event = getFirstEvent(activity);
  if (!event) return null;

  const statusMap: Record<
    BlockchainActivityEvent['action'],
    Record<OnChainActivityStatus, string>
  > = {
    sent: { success: 'Sent', pending: 'Sending', failed: 'Send Failed' },
    received: { success: 'Received', pending: '', failed: 'Receive fail' },
    locked: { success: 'Locked', pending: 'Locking', failed: 'Lock failed' },
    minted: { success: 'Minted', pending: 'Minting', failed: 'Mint failed' },
    burned: { success: 'Burned', pending: 'Burning', failed: 'Burn failed' },
  };

  return statusMap[event.action]?.[activity.status] ?? null;
}

function getStatusIndicator(activity: BlockchainActivity): ActivityStatusIndicatorId {
  switch (activity.status) {
    case 'pending':
      return 'pending';
    case 'failed':
      return 'failed';
    case 'success': {
      if (activity.contract?.type === 'call') return 'function';

      const event = getFirstEvent(activity);
      if (!event) return 'hidden';

      switch (event.action) {
        case 'sent':
          return 'sent';
        case 'received':
          return 'received';
        default:
          return 'hidden';
      }
    }
    default:
      return 'hidden';
  }
}

function getBalances(activity: BlockchainActivity): ActivityBalances {
  const event = getFirstEvent(activity);
  if (!event) return {};

  const isReceived = event.action === 'received';
  const isSent = event.action === 'sent';

  function getOperator() {
    if (isReceived) return '+';
    if (isSent) return minusSign;
    return undefined;
  }

  return {
    operator: getOperator(),
    color:
      isReceived && activity.status === 'success'
        ? 'green.action-primary-default'
        : 'ink.text-primary',
    crypto: event.amount.crypto,
    quote: event.amount.quote,
  };
}

function getAvatar(activity: BlockchainActivity): ActivityAvatar {
  const event = getFirstEvent(activity);
  if (event) return 'asset';
  return 'fallback';
}

export function createBlockchainActivityView(
  activity: BlockchainActivity,
  networkPreference: NetworkConfiguration
): ActivityView {
  const asset = getAsset(activity);

  return {
    key: `${activity.txid}-${activity.timestamp}`,
    txid: activity.txid,
    asset,
    title: getTitle(activity),
    caption: getCaption(activity),
    timestamp: activity.timestamp,
    statusLabel: getStatusLabel(activity),
    balances: getBalances(activity),
    activityLink: makeActivityLink({ txid: activity.txid, networkPreference, asset }),
    activityAvatar: getAvatar(activity),
    statusIndicator: getStatusIndicator(activity),
  };
}
