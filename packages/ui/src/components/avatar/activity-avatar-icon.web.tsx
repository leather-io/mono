import { ReactElement } from 'react';

import { styled } from 'leather-styles/jsx';

import type { ActivityStatusIndicatorId, ActivityView } from '@leather.io/features';
import { type CryptoAsset } from '@leather.io/models';

import { FailedIcon } from '../../icons/activity/failed-icon.web';
import { FunctionActivityIcon } from '../../icons/activity/function-icon.web';
import { PendingIcon } from '../../icons/activity/pending-icon.web';
import { ReceivedIcon } from '../../icons/activity/received-icon.web';
import { SentIcon } from '../../icons/activity/sent-icon.web';
import { SwapIcon } from '../../icons/activity/swap-icon.web';
import { AssetAvatarIcon } from './asset-avatar-icon.web';
import { getAvatarUrl } from './avatar.shared';
import { Avatar } from './avatar.web';

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
  fromAsset: CryptoAsset;
  toAsset: CryptoAsset;
  indicator?: ReactElement;
}
function SwapAvatarIcon({ fromAsset, toAsset, indicator }: SwapAvatarIconProps): ReactElement {
  return (
    <styled.div position="relative" width="40px" height="40px">
      <styled.div position="absolute" top={3} right={15} zIndex={1}>
        <AssetAvatarIcon asset={fromAsset} size="md" />
      </styled.div>
      <styled.div
        borderRadius="round"
        border="2px solid"
        borderColor="ink.background-primary"
        position="absolute"
        bottom={0}
        left={8}
        zIndex={2}
      >
        <AssetAvatarIcon asset={toAsset} indicator={indicator} size="lg" />
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

  return <Avatar image={getAvatarUrl(activity.key)} indicator={indicator} />;
}
