import XLogo from '../assets/icons/x-logo.svg';
import { Icon, IconProps } from './icon/icon.native';

export function XLogoIcon({ variant, ...props }: IconProps) {
  // TODO: Need svg for small variant
  return (
    <Icon {...props}>
      <XLogo />
    </Icon>
  );
}
