import { stxAsset } from '@leather.io/constants';
import type { Activity, CryptoAsset, OnChainActivityStatus } from '@leather.io/models';

import type { ActivityAvatar } from './types';

export function hasTxDetails(
  activity: Activity
): activity is Activity & { txid: string; status: OnChainActivityStatus } {
  return 'txid' in activity && 'status' in activity;
}

export function getActivityTitle(activity: Activity) {
  switch (activity.type) {
    case 'sendAsset':
    case 'receiveAsset':
      if (!activity.value?.crypto?.symbol) {
        return `Token Transfer`;
      }
      return activity.value?.crypto?.symbol;
    case 'deploySmartContract':
    case 'executeSmartContract':
      return activity.contractId.split('.').pop() || `Unknown`;
    case 'swapAssets':
      if ('sbtcBridgeStatus' in activity) {
        return `BTC → sBTC`;
      }
      return `Swap Assets`;
    case 'lockAsset':
      return `Lock Asset`;
    case 'connectApp':
    case 'signMessage':
      if ('appName' in activity && activity.appName) return activity.appName;
      return `Wallet Activity`;
    case 'walletAdded':
    case 'receiveAnnouncement':
    case 'featureWaitlistNotification':
      if ('title' in activity && activity.title) return activity.title;
      return `Announcement`;
    default:
      return `Unknown`;
  }
}

export function getActivityAsset(activity: Activity): CryptoAsset | undefined {
  if ('asset' in activity) return activity.asset;
  if (activity.type === 'swapAssets') return activity.toAsset;
  if (activity.type === 'deploySmartContract' || activity.type === 'executeSmartContract')
    return stxAsset;
  return undefined;
}

export function getActivityAvatar(activity: Activity): ActivityAvatar {
  if (activity.type === 'swapAssets') return 'swap';
  return getActivityAsset(activity) ? 'asset' : 'fallback';
}
