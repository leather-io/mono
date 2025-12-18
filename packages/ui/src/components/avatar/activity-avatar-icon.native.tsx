import { ReactElement } from 'react';

import type { ActivityStatusIndicatorId, ActivityView } from '@leather.io/features';

import { FailedIcon } from '../../icons/activity/failed-icon.native';
import { FunctionActivityIcon } from '../../icons/activity/function-icon.native';
import { PendingIcon } from '../../icons/activity/pending-icon.native';
import { ReceivedIcon } from '../../icons/activity/received-icon.native';
import { SentIcon } from '../../icons/activity/sent-icon.native';
import { SwapIcon } from '../../icons/activity/swap-icon.native';
import { Box } from '../box/box.native';
import { AssetAvatarIcon } from './asset-avatar-icon.native';
import { Avatar } from './avatar.native';
import { getAvatarUrl } from './avatar.shared';
import type { AssetForAvatar } from './types.shared';

interface StatusIndicatorProps {
  indicator: ActivityStatusIndicatorId;
}
function StatusIndicator({ indicator }: StatusIndicatorProps): ReactElement | null {
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

interface SwapAvatarIconProps {
  fromAsset: AssetForAvatar;
  toAsset: AssetForAvatar;
  indicator?: ReactElement;
}

function SwapAvatarIcon({ fromAsset, toAsset, indicator }: SwapAvatarIconProps) {
  return (
    <Box position="relative" style={{ width: 76, height: 48 }}>
      <Box position="absolute" style={{ top: 4, left: 0, zIndex: 1, opacity: 0.6 }}>
        <AssetAvatarIcon asset={fromAsset} size="lg" />
      </Box>
      <Box
        borderRadius="round"
        borderWidth={3}
        borderColor="ink.background-primary"
        position="absolute"
        style={{ top: 0, left: 28, zIndex: 2 }}
      >
        <AssetAvatarIcon asset={toAsset} indicator={indicator} size="xl" />
      </Box>
    </Box>
  );
}

interface ActivityAvatarIconProps {
  activity: ActivityView;
}

export function ActivityAvatarIcon({ activity }: ActivityAvatarIconProps) {
  const indicator =
    activity.statusIndicator === 'hidden' ? undefined : (
      <StatusIndicator indicator={activity.statusIndicator} />
    );

  if (activity.activityAvatar === 'swap' && activity.fromAsset && activity.toAsset) {
    return (
      <SwapAvatarIcon
        fromAsset={activity.fromAsset}
        toAsset={activity.toAsset}
        indicator={indicator}
      />
    );
  }

  if (activity.asset) {
    return <AssetAvatarIcon asset={activity.asset} indicator={indicator} />;
  }

  return <Avatar image={getAvatarUrl(activity.key)} indicator={indicator} size="xl" />;
}
