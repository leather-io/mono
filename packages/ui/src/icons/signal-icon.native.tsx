import SignalSmall from '../assets/icons/signal-16-16.svg';
import Signal from '../assets/icons/signal-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function SignalIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <SignalSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Signal />
    </Icon>
  );
}
