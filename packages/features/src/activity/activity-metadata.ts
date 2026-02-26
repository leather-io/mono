import { stxAsset } from '@leather.io/constants';
import type { Activity, CryptoAsset, OnChainActivityStatus } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { hasActivityStatus } from './activity-status';
import type { ActivityAvatar } from './types';

export function hasTxDetails(
  activity: Activity
): activity is Activity & { txid: string; status: OnChainActivityStatus } {
  return 'txid' in activity && 'status' in activity;
}

function getDeployTitle(status: string): string {
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

function getSwapTitle(activity: Activity & { type: 'swapAssets' }): string {
  const fromSymbol = activity.fromValue?.crypto?.symbol ?? activity.fromAsset.category;
  const toSymbol = activity.toValue?.crypto?.symbol ?? activity.toAsset.category;
  const fromAmount = activity.fromValue?.crypto?.amount.toNumber();
  const toAmount = activity.toValue?.crypto?.amount.toNumber();

  if (fromAmount != null && toAmount != null) {
    return `${fromAmount} ${fromSymbol} → ${toAmount} ${toSymbol}`;
  }
  return `${fromSymbol} → ${toSymbol}`;
}

export function getActivityTitle(activity: Activity) {
  switch (activity.type) {
    case 'sendAsset':
    case 'receiveAsset':
      return activity.value?.crypto?.symbol ?? 'Token Transfer';
    case 'deploySmartContract': {
      const status = hasActivityStatus(activity) ? activity.status : 'success';
      return getDeployTitle(status);
    }
    case 'executeSmartContract':
      return activity.functionName;
    case 'swapAssets':
      return getSwapTitle(activity);
    case 'lockAsset':
      return activity.value?.crypto?.symbol ?? 'Lock Asset';
    case 'connectApp':
    case 'signMessage':
      if ('appName' in activity && activity.appName) return activity.appName;
      return 'Wallet Activity';
    case 'walletAdded':
    case 'receiveAnnouncement':
    case 'featureWaitlistNotification':
      if ('title' in activity && activity.title) return activity.title;
      return 'Announcement';
    default:
      return 'Unknown';
  }
}

function getSendCaption(activity: Activity & { type: 'sendAsset' }): string {
  const address = activity.receivers[0];
  const truncated = address ? truncateMiddle(address, 4) : '';
  const status = hasActivityStatus(activity) ? activity.status : 'success';

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
}

function getReceiveCaption(activity: Activity & { type: 'receiveAsset' }): string {
  const address = activity.senders[0];
  const truncated = address ? truncateMiddle(address, 4) : '';
  const status = hasActivityStatus(activity) ? activity.status : 'success';

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
}

function getSwapCaption(activity: Activity & { type: 'swapAssets' }): string {
  const status = hasActivityStatus(activity) ? activity.status : 'success';

  switch (status) {
    case 'pending':
      return 'Swapping';
    case 'success':
      return 'Swapped';
    case 'failed':
      return 'Swap failed';
    default:
      return 'Swap';
  }
}

function getContractName(contractId: string): string {
  return contractId.split('.').pop() ?? contractId;
}

export function getActivityCaption(activity: Activity): string {
  switch (activity.type) {
    case 'sendAsset':
      return getSendCaption(activity);
    case 'receiveAsset':
      return getReceiveCaption(activity);
    case 'swapAssets':
      return getSwapCaption(activity);
    case 'deploySmartContract':
      return getContractName(activity.contractId);
    case 'executeSmartContract':
      return getContractName(activity.contractId);
    case 'lockAsset':
      return activity.value?.crypto?.symbol ?? 'Lock';
    default:
      return '';
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
