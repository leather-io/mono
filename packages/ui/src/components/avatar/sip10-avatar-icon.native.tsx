import type { ReactElement } from 'react';

import SbtcIcon from '../../assets/icons/sbtc.svg';
import StacksIcon from '../../assets/icons/stacks.svg';
import { Avatar, type AvatarProps } from './avatar.native';
import { getSip10AvatarImage } from './avatar.shared';

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
    return (
      <Avatar icon={<SbtcIcon width="100%" height="100%" />} indicator={indicatorIcon} {...props} />
    );
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
