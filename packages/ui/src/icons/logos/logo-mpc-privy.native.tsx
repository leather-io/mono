import LogoMpcPrivyLogo from '../../assets/icons/logos/logo-mpc-privy-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoMpcPrivy({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoMpcPrivyLogo />
    </Icon>
  );
}
