import SbtcIcon from '../../assets/icons/sbtc.svg';
import StacksIcon from '../../assets/icons/stacks.svg';
import { Avatar, type AvatarProps } from './avatar.native';

function getFallbackAvatar(contractId: string) {
  // TODO LEA-2264 use avatars from Alex API
  // extension uses StacksAssetAvatar and DynamicColorCircle for this
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
  // TODO LEA-2551: use leather design system for more avatars
  if (name === 'sBTC') {
    <Avatar
      icon={<SbtcIcon width="100%" height="100%" />}
      indicator={<StacksIcon width={16} height={16} />}
      {...props}
    />;
  }
  return (
    <Avatar
      image={imageCanonicalUri !== '' ? imageCanonicalUri : getFallbackAvatar(contractId)}
      imageAlt={name}
      indicator={indicator ? <StacksIcon width={16} height={16} /> : undefined}
      showFauxBorder={false}
      {...props}
    />
  );
}
