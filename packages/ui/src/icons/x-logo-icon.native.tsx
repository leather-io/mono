import XLogo from '../assets/icons/x-logo.svg';
import { Icon, IconProps } from './icon/icon.native';

export function XLogoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <XLogo />
    </Icon>
  );
}
