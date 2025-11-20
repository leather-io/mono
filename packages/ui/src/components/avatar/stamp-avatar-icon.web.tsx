import StampIconSrc from '../../assets/icons/stamp-24-24.svg';
import { Avatar, type AvatarProps } from './avatar.web';

const fallback = 'ST';

export function StampAvatarIcon(props: AvatarProps) {
  return <Avatar fallback={fallback} image={StampIconSrc} {...props} />;
}
