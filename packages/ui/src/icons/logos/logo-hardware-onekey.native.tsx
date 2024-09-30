import LogoHardwareOnekeyLogo from '../../assets/icons/logos/logo-hardware-onekey-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoHardwareOnekey({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoHardwareOnekeyLogo />
    </Icon>
  );
}
