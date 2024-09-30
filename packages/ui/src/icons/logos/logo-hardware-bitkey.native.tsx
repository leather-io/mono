import LogoHardwareBitkeyLogo from '../../assets/icons/logos/logo-hardware-bitkey-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoHardwareBitkey({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoHardwareBitkeyLogo />
    </Icon>
  );
}
