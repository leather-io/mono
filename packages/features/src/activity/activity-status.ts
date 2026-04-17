import {
  type Activity,
  type BaseOnChainActivity,
  isFungibleAsset,
  isInscriptionAsset,
} from '@leather.io/models';

import type { ActivityStatusIndicatorId } from './types';

export function hasActivityStatus(activity: Activity): activity is Activity & {
  status: BaseOnChainActivity['status'];
} {
  return 'status' in activity;
}

const fallbackActivityStatus: BaseOnChainActivity['status'] = 'success';

function getActivityStatusMap(): Record<
  Activity['type'],
  Record<BaseOnChainActivity['status'], string>
> {
  return {
    sendAsset: {
      success: `Sent`,
      pending: `Sending`,
      failed: `Send Failed`,
    },
    receiveAsset: {
      success: `Received`,
      pending: '',
      failed: `Receive fail`,
    },
    executeSmartContract: {
      success: `Executed`,
      pending: `Executing`,
      failed: `Execution failed`,
    },
    deploySmartContract: {
      success: `Deployed`,
      pending: `Deploying`,
      failed: `Deployment failed`,
    },
    lockAsset: {
      success: `Locked`,
      pending: `Locking`,
      failed: `Lock failed`,
    },
    swapAssets: {
      success: `Swapped`,
      pending: `Swapping`,
      failed: `Swap failed`,
    },
    connectApp: {
      success: `Connected`,
      pending: `Connecting`,
      failed: `Connection failed`,
    },
    signMessage: {
      success: `Signed`,
      pending: `Signing`,
      failed: `Signing failed`,
    },
    walletAdded: {
      success: `Wallet added`,
      pending: `Adding wallet`,
      failed: `Adding wallet failed`,
    },
    receiveAnnouncement: {
      success: `Announcement received`,
      pending: `Receiving announcement`,
      failed: `Receiving announcement failed`,
    },
    featureWaitlistNotification: {
      success: `Feature waitlist notification`,
      pending: `Receiving feature waitlist notification`,
      failed: `Receiving feature waitlist notification failed`,
    },
  };
}

export function formatActivityStatusLabel(activity: Activity) {
  const activityStatusMap = getActivityStatusMap();

  switch (activity.type) {
    case 'deploySmartContract':
    case 'executeSmartContract': {
      const contractName = activity.contractId.split('.')[1];
      return contractName ?? 'Unknown';
    }
    case 'swapAssets':
      if ('sbtcBridgeStatus' in activity && activity.sbtcBridgeStatus) {
        switch (activity.sbtcBridgeStatus) {
          case 'pending':
            return 'Pending deposit';
          case 'accepted':
            return 'Pending mint';
          case 'failed':
            return 'Failed';
          case 'rbf':
            return 'Replaced';
          case 'confirmed':
            return 'Confirmed';
          default:
            return undefined;
        }
      }
      if (isFungibleAsset(activity.fromAsset) && isFungibleAsset(activity.toAsset)) {
        return `${activity.fromAsset.symbol} → ${activity.toAsset.symbol}`;
      } else if (isInscriptionAsset(activity.fromAsset) && isInscriptionAsset(activity.toAsset)) {
        return `${activity.fromAsset.title} → ${activity.toAsset.title}`;
      }
      return `${activity.fromAsset.category} → ${activity.toAsset.category}`;
    default: {
      const status = hasActivityStatus(activity) ? activity.status : fallbackActivityStatus;
      return activityStatusMap[activity.type][status];
    }
  }
}

export function getActivityStatusIndicatorId(activity: Activity): ActivityStatusIndicatorId {
  if (!hasActivityStatus(activity)) return 'hidden';

  switch (activity.status) {
    case 'pending':
      return 'pending';
    case 'failed':
      return 'failed';
    case 'success':
      switch (activity.type) {
        case 'sendAsset':
          return 'sent';
        case 'receiveAsset':
          return 'received';
        case 'swapAssets':
          return 'swap';
        case 'executeSmartContract':
          return 'function';
        default:
          return 'hidden';
      }
    default:
      return 'hidden';
  }
}
