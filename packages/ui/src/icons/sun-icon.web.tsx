import SunSmall from '../assets/icons/sun-16-16.svg';
import Sun from '../assets/icons/sun-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function SunIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <SunSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Sun />
    </Icon>
  );
}
