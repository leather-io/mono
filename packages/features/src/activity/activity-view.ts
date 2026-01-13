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

const sbtcReclaimUrl = 'https://app.stacks.co/reclaim?depositTxId=';

function getActivityKey(activity: Activity): string {
  if ('txid' in activity) return activity.txid;
  return `${activity.type}-${activity.timestamp}`;
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
  const activityLink = (() => {
    if (
      activity.type === 'swapAssets' &&
      'sbtcBridgeStatus' in activity &&
      activity.sbtcBridgeStatus === 'failed'
    ) {
      return `${sbtcReclaimUrl}${activity.txid}`;
    }
    if (hasTxDetails(activity) && asset) {
      return makeActivityLink({ txid: activity.txid, networkPreference, asset });
    }
    return null;
  })();

  return {
    key: getActivityKey(activity),
    asset,
    fromAsset,
    toAsset,
    title,
    caption: combinedCaption,
    statusLabel,
    balances,
    activityLink,
    activityAvatar,
    statusIndicator,
  };
}
