import StampsIcon from '../../assets-web/images/stamps-icon.png';
import { Avatar, type AvatarProps } from './avatar.web';

const fallback = 'ST';

export function StampAvatarIcon(props: AvatarProps) {
  return <Avatar fallback={fallback} image={StampsIcon} {...props} />;
}
