import MoonSmall from '../assets/icons/moon-16-16.svg';
import Moon from '../assets/icons/moon-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function MoonIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <MoonSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Moon />
    </Icon>
  );
}
