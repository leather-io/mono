import HeadsetSmall from '../assets/icons/headset-16-16.svg';
import Headset from '../assets/icons/headset-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function HeadsetIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <HeadsetSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Headset />
    </Icon>
  );
}
