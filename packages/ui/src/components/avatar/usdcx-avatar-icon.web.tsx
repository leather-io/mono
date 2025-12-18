import UsdcxIcon from '../../assets/icons/usdcx.svg';
import { Avatar, type AvatarProps } from './avatar.web';

export function UsdcxAvatarIcon(props: AvatarProps) {
  return (
    <Avatar
      outlineColor="ink.border-transparent"
      icon={<UsdcxIcon width="100%" height="100%" />}
      {...props}
    />
  );
}
