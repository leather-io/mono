import UsdcxIcon from '../../assets/icons/usdcx.svg';
import { Avatar, type AvatarProps } from './avatar.native';

export function UsdcxAvatarIcon(props: AvatarProps) {
  return <Avatar icon={<UsdcxIcon width="100%" height="100%" />} showFauxBorder {...props} />;
}
