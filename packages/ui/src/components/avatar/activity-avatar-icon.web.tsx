import { ReactElement } from 'react';

import { styled } from 'leather-styles/jsx';

import {
  ActivityType,
  CryptoAsset,
  type OnChainActivity,
  OnChainActivityStatus,
} from '@leather.io/models';
import { assertUnreachable } from '@leather.io/utils';

import { FailedIcon } from '../../icons/activity/failed-icon.web';
import { FunctionActivityIcon } from '../../icons/activity/function-icon.web';
import { PendingIcon } from '../../icons/activity/pending-icon.web';
import { ReceivedIcon } from '../../icons/activity/received-icon.web';
import { SentIcon } from '../../icons/activity/sent-icon.web';
import { SwapIcon } from '../../icons/activity/swap-icon.web';
import { AvatarProps } from './avatar.web';
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
      }
      if (type === 'executeSmartContract') {
        return <FunctionActivityIcon width={16} height={16} />;
      }
      if (type === 'swapAssets') {
        return <SwapIcon width={16} height={16} />;
      }
      if (type === 'receiveAsset') {
        return <ReceivedIcon width={16} height={16} />;
      }
      // show hidden icon
      return <ReceivedIcon width={0} height={0} />;
    case 'failed':
      return <FailedIcon width={16} height={16} />;
    default:
      assertUnreachable(status);
  }
}

interface AssetAvatarProps extends AvatarProps {
  asset: CryptoAsset;
  indicator?: ReactElement;
}

function AssetAvatar({ asset, indicator, size, ...rest }: AssetAvatarProps): ReactElement {
  switch (asset.protocol) {
    case 'nativeStx':
      return <StxAvatarIcon indicator={indicator} size={size} {...rest} />;
    case 'nativeBtc':
      return <BtcAvatarIcon indicator={indicator} size={size} {...rest} />;
    case 'sip10':
      return (
        <Sip10AvatarIcon
          contractId={asset.contractId}
          imageCanonicalUri={asset.imageCanonicalUri}
          indicator={indicator}
          name={asset.name}
          size={size}
          {...rest}
        />
      );
    default:
      return <Sip10AvatarIcon contractId="" imageCanonicalUri="" name="" size={size} {...rest} />;
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
        <AssetAvatar asset={fromAsset} size="md" />
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
        <AssetAvatar asset={toAsset} indicator={indicator} size="lg" />
      </styled.div>
    </styled.div>
  );
}

interface ActivityIconProps {
  activity: OnChainActivity;
}
export function ActivityAvatarIcon({ activity }: ActivityIconProps) {
  const statusIndicator = <StatusIndicator type={activity.type} status={activity.status} />;

  if (activity.type === 'swapAssets') {
    return (
      <SwapAvatarIcon
        fromAsset={activity.fromAsset}
        toAsset={activity.toAsset}
        indicator={statusIndicator}
      />
    );
  }

  const asset = 'asset' in activity ? activity?.asset : undefined;
  if (asset) {
    return <AssetAvatar asset={asset} indicator={statusIndicator} />;
  }

  return (
    <Sip10AvatarIcon
      contractId={activity.type}
      indicator={statusIndicator}
      imageCanonicalUri=""
      name=""
    />
  );
}
