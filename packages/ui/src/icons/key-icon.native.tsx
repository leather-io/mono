import KeySmall from '../assets/icons/key-16-16.svg';
import Key from '../assets/icons/key-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function KeyIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <KeySmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Key />
    </Icon>
  );
}
