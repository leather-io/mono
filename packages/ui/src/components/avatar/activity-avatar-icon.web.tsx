import { ReactElement } from 'react';

import { styled } from 'leather-styles/jsx';

import type { ActivityStatusIndicatorId, ActivityView } from '@leather.io/features';

import { FailedIcon } from '../../icons/activity/failed-icon.web';
import { FunctionActivityIcon } from '../../icons/activity/function-icon.web';
import { PendingIcon } from '../../icons/activity/pending-icon.web';
import { ReceivedIcon } from '../../icons/activity/received-icon.web';
import { SentIcon } from '../../icons/activity/sent-icon.web';
import { SwapIcon } from '../../icons/activity/swap-icon.web';
import { AssetAvatarIcon } from './asset-avatar-icon.web';
import { getAvatarUrl } from './avatar.shared';
import { Avatar } from './avatar.web';
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
    case 'function':
      return <FunctionActivityIcon width={16} height={16} />;
    case 'swap':
      return <SwapIcon width={16} height={16} />;
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
function SwapAvatarIcon({ fromAsset, toAsset, indicator }: SwapAvatarIconProps): ReactElement {
  return (
    <styled.div position="relative" width="76px" height="48px">
      <styled.div position="absolute" top="4px" left={0} zIndex={1} opacity={0.6}>
        <AssetAvatarIcon asset={fromAsset} size="lg" />
      </styled.div>
      <styled.div
        borderRadius="round"
        border="3px solid"
        borderColor="ink.background-primary"
        position="absolute"
        top={0}
        left="28px"
        zIndex={2}
      >
        <AssetAvatarIcon asset={toAsset} indicator={indicator} size="xl" />
      </styled.div>
    </styled.div>
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
