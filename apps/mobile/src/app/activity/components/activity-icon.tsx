import { ActivityType, FungibleCryptoAssetInfo, OnChainActivityStatus } from '@leather.io/models';
import { Avatar, BtcAvatarIcon, Sip10AvatarIcon, StxAvatarIcon } from '@leather.io/ui/native';

import { StatusIndicator } from './status-indicator';

interface ActivityIconProps {
  type: ActivityType;
  asset?: FungibleCryptoAssetInfo;
  status?: OnChainActivityStatus;
}

function getActivityIcon(type: ActivityType, asset?: FungibleCryptoAssetInfo) {
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

export function ActivityIcon({ type, asset, status }: ActivityIconProps) {
  return (
    <Avatar
      icon={getActivityIcon(type, asset)}
      indicator={<StatusIndicator type={type} status={status} />}
    />
  );
}
