import InboxSmall from '../assets/icons/inbox-16-16.svg';
import Inbox from '../assets/icons/inbox-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

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
