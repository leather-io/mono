import { ReactElement } from 'react';

import { ActivityType, FungibleCryptoAsset, OnChainActivityStatus } from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import FailedIcon from '../../assets/icons/activity/failed.svg';
import PendingIcon from '../../assets/icons/activity/pending.svg';
import ReceivedIcon from '../../assets/icons/activity/received.svg';
import SentIcon from '../../assets/icons/activity/sent.svg';
import { Avatar } from './avatar.native';
import { BtcAvatarIcon } from './btc-avatar-icon.native';
import { Sip10AvatarIcon } from './sip10-avatar-icon.native';
import { StxAvatarIcon } from './stx-avatar-icon.native';

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

function getActivityIcon(type: ActivityType, asset?: FungibleCryptoAsset) {
  switch (asset?.symbol) {
    case 'STX':
      return <StxAvatarIcon />;
    case 'BTC':
      return <BtcAvatarIcon />;
    default:
      if (asset?.protocol === 'sip10') {
        return (
          <Sip10AvatarIcon
            contractId={asset.contractId}
            imageCanonicalUri={asset.imageCanonicalUri}
            name={asset.name}
          />
        );
      }
      return <Sip10AvatarIcon contractId={type} imageCanonicalUri="" name="" />;
  }
}

interface ActivityIconProps {
  type: ActivityType;
  asset?: FungibleCryptoAsset;
  status: OnChainActivityStatus;
}
export function ActivityAvatarIcon({ type, asset, status }: ActivityIconProps) {
  return (
    <Avatar
      icon={getActivityIcon(type, asset)}
      indicator={<StatusIndicator type={type} status={status} />}
    />
  );
}
