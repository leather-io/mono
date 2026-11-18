import { getProviderIconSrc } from '~/components/icons/provider-icon';

import { Avatar, type AvatarProps, CodeIcon } from '@leather.io/ui';

type StakingPoolAvatarSize = NonNullable<AvatarProps['size']>;

interface StakingPoolAvatarProps {
  providerId: string;
  size?: StakingPoolAvatarSize;
}

export function StakingPoolAvatar({ providerId, size = 'lg' }: StakingPoolAvatarProps) {
  const image = getProviderIconSrc(providerId);

  if (image) return <Avatar variant="square" size={size} image={image} imageAlt="" />;

  return (
    <Avatar
      variant="square"
      size={size}
      icon={<CodeIcon color="ink.text-subdued" />}
      data-testid="staking-pool-avatar-fallback"
    />
  );
}
