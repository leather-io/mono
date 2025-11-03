import SbtcIcon from '../../assets/icons/sbtc.svg';
import StacksIcon from '../../assets/icons/stacks.svg';
import { Avatar, type AvatarProps } from './avatar.web';

function getFallbackAvatar(contractId: string) {
  return `https://avatar.vercel.sh/${contractId}?size=36`;
}

interface Sip10AvatarIconProps extends Omit<AvatarProps, 'indicator'> {
  indicator?: boolean;
  contractId: string;
  imageCanonicalUri: string;
  name: string;
}

export function Sip10AvatarIcon({
  contractId,
  imageCanonicalUri,
  name,
  indicator = false,
  ...props
}: Sip10AvatarIconProps) {
  if (name === 'sBTC') {
    return (
      <Avatar
        outlineColor="ink.border-transparent"
        icon={<SbtcIcon width="100%" height="100%" />}
        indicator={<StacksIcon width={16} height={16} />}
        {...props}
      />
    );
  }

  const imageUrl = imageCanonicalUri !== '' ? imageCanonicalUri : getFallbackAvatar(contractId);
  const fallback = name.substring(0, 2).toUpperCase();

  return (
    <Avatar
      image={imageUrl}
      imageAlt={name}
      fallback={fallback}
      indicator={indicator ? <StacksIcon width={16} height={16} /> : undefined}
      {...props}
    />
  );
}
