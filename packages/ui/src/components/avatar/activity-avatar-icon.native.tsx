import { ReactElement } from 'react';

import type { ActivityStatusIndicatorId, ActivityView } from '@leather.io/features';
import type { CryptoAsset } from '@leather.io/models';

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
  fromAsset: CryptoAsset;
  toAsset: CryptoAsset;
  indicator?: ReactElement;
}

function SwapAvatarIcon({ fromAsset, toAsset, indicator }: SwapAvatarIconProps) {
  return (
    <Box position="relative" style={{ width: 40, height: 40 }}>
      <Box position="absolute" style={{ top: 3, right: 15, zIndex: 1 }}>
        <AssetAvatarIcon asset={fromAsset} size="md" />
      </Box>
      <Box
        borderRadius="round"
        borderWidth={2}
        borderColor="ink.background-primary"
        position="absolute"
        style={{ bottom: 0, left: 8, zIndex: 2 }}
        overflow="hidden"
      >
        <AssetAvatarIcon asset={toAsset} indicator={indicator} size="lg" />
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

  return <Avatar image={getAvatarUrl(activity.key)} indicator={indicator} />;
}
