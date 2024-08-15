import InboxSmall from '../assets/icons/inbox-small.svg';
import Inbox from '../assets/icons/inbox.svg';
import { Icon, IconProps } from './icon/icon.native';

export function InboxIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <InboxSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Inbox />
    </Icon>
  );
}
