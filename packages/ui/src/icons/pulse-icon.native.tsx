import PulseSmall from '../assets/icons/pulse-16-16.svg';
import Pulse from '../assets/icons/pulse-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function PulseIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <PulseSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Pulse />
    </Icon>
  );
}
