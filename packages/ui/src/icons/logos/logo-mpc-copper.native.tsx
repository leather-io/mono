import LogoMpcCopperLogo from '../../assets/icons/logos/logo-mpc-copper-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoMpcCopper({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoMpcCopperLogo />
    </Icon>
  );
}
