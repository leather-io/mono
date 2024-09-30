import LogoHardwareFoundationLogo from '../../assets/icons/logos/logo-hardware-foundation-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoHardwareFoundation({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoHardwareFoundationLogo />
    </Icon>
  );
}
