import { SBTC_RECLAIM_URL } from '@leather.io/constants';
import type { Activity, NetworkConfiguration } from '@leather.io/models';

import { getActivityBalances } from './activity-balance';
import { makeActivityLink } from './activity-links';
import {
  getActivityAsset,
  getActivityAvatar,
  getActivityTitle,
  hasTxDetails,
} from './activity-metadata';
import { formatActivityStatusLabel, getActivityStatusIndicatorId } from './activity-status';
import { formatActivityCaption } from './activity-timestamp';
import type { ActivityView } from './types';

function getActivityUniqueIdentifier(activity: Activity): string {
  switch (activity.type) {
    case 'receiveAsset': {
      const sender = activity.senders?.[0] ?? '';
      const amount = activity.amount.toString();
      const assetProtocol = activity.asset.protocol;
      return `${sender}-${amount}-${assetProtocol}`;
    }
    case 'sendAsset': {
      const receiver = activity.receivers?.[0] ?? '';
      const amount = activity.amount.toString();
      const assetProtocol = activity.asset.protocol;
      return `${receiver}-${amount}-${assetProtocol}`;
    }
    case 'swapAssets': {
      const fromAmount = activity.fromAmount.toString();
      const toAmount = activity.toAmount.toString();
      return `${activity.fromAsset.protocol}-${fromAmount}-${activity.toAsset.protocol}-${toAmount}`;
    }
    case 'lockAsset': {
      const amount = activity.amount.toString();
      const assetProtocol = activity.asset.protocol;
      return `${amount}-${assetProtocol}`;
    }
    case 'deploySmartContract':
      return activity.contractId;
    case 'executeSmartContract':
      return `${activity.contractId}-${activity.functionName}`;
    default:
      return '';
  }
}

function getActivityKey(activity: Activity): string {
  if (activity.level === 'account') {
    const accountKey = `${activity.account.fingerprint}-${activity.account.accountIndex}`;
    if ('txid' in activity) {
      const activityKey = getActivityUniqueIdentifier(activity);
      // Include timestamp to ensure uniqueness for activities that might have identical properties
      return activityKey
        ? `${accountKey}-${activity.txid}-${activity.type}-${activityKey}-${activity.timestamp}`
        : `${accountKey}-${activity.txid}-${activity.type}-${activity.timestamp}`;
    }
    return `${accountKey}-${activity.type}-${activity.timestamp}`;
  }
  return `${activity.type}-${activity.timestamp}`;
}

function hasSbtcBridgeFailed(activity: Activity): boolean {
  return (
    activity.type === 'swapAssets' &&
    'sbtcBridgeStatus' in activity &&
    activity.sbtcBridgeStatus === 'failed'
  );
}

function getActivityLink(
  activity: Activity,
  asset: ReturnType<typeof getActivityAsset>,
  networkPreference: NetworkConfiguration
) {
  if (hasSbtcBridgeFailed(activity)) {
    return SBTC_RECLAIM_URL;
  }
  if (hasTxDetails(activity) && asset) {
    return makeActivityLink({ txid: activity.txid, networkPreference, asset });
  }
  return null;
}

export function createActivityView(
  activity: Activity,
  networkPreference: NetworkConfiguration
): ActivityView {
  const asset = getActivityAsset(activity);
  const balances = getActivityBalances(activity);
  const title = getActivityTitle(activity);
  const statusLabel = formatActivityStatusLabel(activity);
  const caption = formatActivityCaption(activity);
  const combinedCaption = statusLabel ? `${statusLabel} ${caption}` : caption;

  const activityAvatar = getActivityAvatar(activity);
  const statusIndicator = getActivityStatusIndicatorId(activity);
  const fromAsset = activity.type === 'swapAssets' ? activity.fromAsset : undefined;
  const toAsset = activity.type === 'swapAssets' ? activity.toAsset : undefined;

  const activityLink = getActivityLink(activity, asset, networkPreference);

  return {
    key: getActivityKey(activity),
    asset,
    fromAsset,
    toAsset,
    title,
    caption: combinedCaption,
    statusLabel: statusLabel ?? null,
    balances,
    activityLink,
    activityAvatar,
    statusIndicator,
  };
}
