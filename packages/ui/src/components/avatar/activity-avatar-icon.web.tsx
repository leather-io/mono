import { ReactElement } from 'react';

import { ActivityType, type OnChainActivity, OnChainActivityStatus } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { FailedIcon } from '../../icons/activity/failed-icon.web';
import { PendingIcon } from '../../icons/activity/pending-icon.web';
import { ReceivedIcon } from '../../icons/activity/received-icon.web';
import { SentIcon } from '../../icons/activity/sent-icon.web';
import { BtcAvatarIcon } from './btc-avatar-icon.web';
import { Sip10AvatarIcon } from './sip10-avatar-icon.web';
import { StxAvatarIcon } from './stx-avatar-icon.web';

interface StatusIndicatorProps {
  type: ActivityType;
  status: OnChainActivityStatus;
}
function StatusIndicator({ type, status }: StatusIndicatorProps): ReactElement {
  switch (status) {
    case 'pending':
      return <PendingIcon width={16} height={16} />;
    case 'success':
      if (type == 'sendAsset') {
        return <SentIcon width={16} height={16} />;
      } else {
        return <ReceivedIcon width={16} height={16} />;
      }
    case 'failed':
      return <FailedIcon width={16} height={16} />;
    default:
      assertUnreachable(status);
  }
}

interface ActivityIconProps {
  activity: OnChainActivity;
}
export function ActivityAvatarIcon({ activity }: ActivityIconProps) {
  const asset = 'asset' in activity ? activity?.asset : undefined;
  const statusIndicator = <StatusIndicator type={activity.type} status={activity.status} />;
  switch (asset?.protocol) {
    case 'nativeStx':
      return <StxAvatarIcon indicator={statusIndicator} />;
    case 'nativeBtc':
      return <BtcAvatarIcon indicator={statusIndicator} />;
    default:
      if (asset?.protocol === 'sip10') {
        return (
          <Sip10AvatarIcon
            contractId={asset.contractId}
            imageCanonicalUri={asset.imageCanonicalUri}
            indicator={statusIndicator}
            name={asset.name}
          />
        );
      }
      return <Sip10AvatarIcon contractId={activity.type} imageCanonicalUri="" name="" />;
  }
}
