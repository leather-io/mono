import { ReactElement } from 'react';

import type { ActivityStatusIndicatorId, ActivityView } from '@leather.io/features';
import { CryptoAsset } from '@leather.io/models';

import { FailedIcon } from '../../icons/activity/failed-icon.native';
import { FunctionActivityIcon } from '../../icons/activity/function-icon.native';
import { PendingIcon } from '../../icons/activity/pending-icon.native';
import { ReceivedIcon } from '../../icons/activity/received-icon.native';
import { SentIcon } from '../../icons/activity/sent-icon.native';
import { SwapIcon } from '../../icons/activity/swap-icon.native';
import { Avatar } from './avatar.native';
import { BtcAvatarIcon } from './btc-avatar-icon.native';
import { Sip10AvatarIcon } from './sip10-avatar-icon.native';
import { StxAvatarIcon } from './stx-avatar-icon.native';

function renderStatusIndicator(indicator: ActivityStatusIndicatorId): ReactElement | null {
  switch (indicator) {
    case 'pending':
      return <PendingIcon width={16} height={16} />;
    case 'failed':
      return <FailedIcon width={16} height={16} />;
    case 'sent':
      return <SentIcon width={16} height={16} />;
    case 'swap':
      return <SwapIcon width={16} height={16} />;
    case 'function':
      return <FunctionActivityIcon width={16} height={16} />;
    case 'received':
      return <ReceivedIcon width={16} height={16} />;
    case 'hidden':
    default:
      return null;
  }
}

function getAssetIcon(asset: CryptoAsset) {
  if (asset.protocol === 'nativeStx') {
    return <StxAvatarIcon />;
  }
  if (asset.protocol === 'nativeBtc') {
    return <BtcAvatarIcon />;
  }
  if (asset.protocol === 'sip10') {
    return (
      <Sip10AvatarIcon
        contractId={asset.contractId}
        imageCanonicalUri={asset.imageCanonicalUri}
        name={asset.name}
      />
    );
  }
  return <Sip10AvatarIcon contractId="" imageCanonicalUri="" name="" />;
}

function getActivityIcon(activity: ActivityView) {
  if (activity.activityAvatar === 'swap') {
    return <SwapIcon width={24} height={24} />;
  }
  if (activity.asset) {
    return getAssetIcon(activity.asset);
  }
  return <Sip10AvatarIcon contractId="" imageCanonicalUri="" name="" />;
}

interface ActivityIconProps {
  activity: ActivityView;
}

export function ActivityAvatarIcon({ activity }: ActivityIconProps) {
  const indicator = renderStatusIndicator(activity.statusIndicator);
  const icon = getActivityIcon(activity);

  return <Avatar icon={icon} indicator={indicator ?? undefined} />;
}
