import CookieSmall from '../assets/icons/cookie-16-16.svg';
import Cookie from '../assets/icons/cookie-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function CookieIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <CookieSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Cookie />
    </Icon>
  );
}
