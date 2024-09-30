import LogoHardwareRyderLogo from '../../assets/icons/logos/logo-hardware-ryder-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoHardwareRyder({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoHardwareRyderLogo />
    </Icon>
  );
}
