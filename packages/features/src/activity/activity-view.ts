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

function getActivityKey(activity: Activity): string {
  if ('txid' in activity) return activity.txid;
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
  const showSbtcReclaimUrl = hasSbtcBridgeFailed(activity) && 'txid' in activity && activity.txid;
  if (showSbtcReclaimUrl) {
    return `${SBTC_RECLAIM_URL}${activity.txid}`;
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
