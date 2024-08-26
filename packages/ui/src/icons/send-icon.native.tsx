import SendSmall from '../assets/icons/send-small.svg';
import Send from '../assets/icons/send.svg';
import { Icon, IconProps } from './icon/icon.native';

export function SendIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <SendSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Send />
    </Icon>
  );
}
