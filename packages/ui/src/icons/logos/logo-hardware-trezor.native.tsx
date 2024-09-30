import LogoHardwareTrezorLogo from '../../assets/icons/logos/logo-hardware-trezor-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoHardwareTrezor({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoHardwareTrezorLogo />
    </Icon>
  );
}
