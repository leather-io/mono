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
  const activityLink =
    hasTxDetails(activity) && asset
      ? makeActivityLink({ txid: activity.txid, networkPreference, asset })
      : null;

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
