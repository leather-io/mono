import Stx20AvatarIconSrc from '../../assets-web/avatars/stx20-avatar-icon.png';
import { Avatar, type AvatarProps } from './avatar.web';

const fallback = 'ST';

export function Stx20AvatarIcon(props: AvatarProps) {
  return (
    <Avatar.Root {...props}>
      <Avatar.Image alt={fallback} src={Stx20AvatarIconSrc} />
      <Avatar.Fallback>{fallback}</Avatar.Fallback>
    </Avatar.Root>
  );
}
