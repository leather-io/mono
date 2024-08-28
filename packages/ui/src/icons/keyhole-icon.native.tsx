import KeyholeSmall from '../assets/icons/keyhole-16-16.svg';
import Keyhole from '../assets/icons/keyhole-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function KeyholeIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <KeyholeSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Keyhole />
    </Icon>
  );
}
