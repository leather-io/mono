import ShieldSmall from '../assets/icons/shield-16-16.svg';
import Shield from '../assets/icons/shield-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function ShieldIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ShieldSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Shield />
    </Icon>
  );
}
