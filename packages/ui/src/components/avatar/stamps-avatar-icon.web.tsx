import StampsAvatarIconSrc from '../../assets-web/avatars/stamps-avatar-icon.png';
import { Avatar, type AvatarProps } from './avatar.web';

const fallback = 'ST';

export function StampsAvatarIcon(props: AvatarProps) {
  return (
    <Avatar.Root {...props}>
      <Avatar.Image alt={fallback} src={StampsAvatarIconSrc} />
      <Avatar.Fallback>{fallback}</Avatar.Fallback>
    </Avatar.Root>
  );
}
