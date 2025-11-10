import StampAvatarIconSrc from '../../assets/images/stamps-avatar-icon.png';
import { Avatar, type AvatarProps } from './avatar.web';

const fallback = 'ST';

export function StampAvatarIcon(props: AvatarProps) {
  return <Avatar fallback={fallback} image={StampAvatarIconSrc} {...props} />;
}
