import type { ReactElement } from 'react';

import StacksIcon from '../../assets/icons/stacks.svg';
import { getSip10AvatarImage } from './avatar.shared';
import { Avatar, type AvatarProps } from './avatar.web';
import { SbtcAvatarIcon } from './sbtc-avatar-icon.web';
import { UsdcxAvatarIcon } from './usdcx-avatar-icon.web';

interface Sip10AvatarIconProps extends Omit<AvatarProps, 'indicator'> {
  indicator?: 'stacksIcon' | ReactElement;
  contractId: string;
  imageCanonicalUri: string;
  name: string;
}

export function Sip10AvatarIcon({
  contractId,
  imageCanonicalUri,
  name,
  indicator,
  ...props
}: Sip10AvatarIconProps) {
  const indicatorIcon =
    indicator === 'stacksIcon' ? <StacksIcon width={16} height={16} /> : indicator;

  if (name === 'sBTC') {
    return <SbtcAvatarIcon indicator={indicatorIcon} {...props} />;
  }

  if (name === 'USDCx') {
    return <UsdcxAvatarIcon indicator={indicatorIcon} {...props} />;
  }

  return (
    <Avatar
      image={getSip10AvatarImage({ imageCanonicalUri, contractId, name })}
      imageAlt={name}
      indicator={indicatorIcon}
      {...props}
    />
  );
}
