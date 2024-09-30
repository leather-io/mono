import LogoMpcFordefiLogo from '../../assets/icons/logos/logo-mpc-fordefi-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoMpcFordefi({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoMpcFordefiLogo />
    </Icon>
  );
}
