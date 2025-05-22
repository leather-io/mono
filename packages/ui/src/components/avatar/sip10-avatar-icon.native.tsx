import StacksIcon from '../../assets/icons/stacks.svg';
import { Avatar } from './avatar.native';
import { SbtcAvatarIcon } from './sbtc-avatar-icon.native';

function getFallbackAvatar(contractId: string) {
  // TODO LEA-2264 use avatars from Alex API
  // extension uses StacksAssetAvatar and DynamicColorCircle for this
  return `https://avatar.vercel.sh/${contractId}?size=36`;
}

interface Sip10AvatarIconProps {
  contractId: string;
  imageCanonicalUri: string;
  name: string;
}

export function Sip10AvatarIcon({ contractId, imageCanonicalUri, name }: Sip10AvatarIconProps) {
  // TODO LEA-2551: use leather design system for more avatars
  if (name === 'sBTC') {
    return <SbtcAvatarIcon />;
  }
  return (
    <Avatar
      image={imageCanonicalUri !== '' ? imageCanonicalUri : getFallbackAvatar(contractId)}
      imageAlt={name}
      indicator={<StacksIcon width={16} height={16} />}
      showFauxBorder={false}
    />
  );
}
