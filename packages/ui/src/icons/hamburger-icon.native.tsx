import HamburgerSmall from '../assets/icons/hamburger-small.svg';
import Hamburger from '../assets/icons/hamburger.svg';
import { Icon, IconProps } from './icon/icon.native';

export function HamburgerIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <HamburgerSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Hamburger />
    </Icon>
  );
}
