import LogoMpcQredoLogo from '../../assets/icons/logos/logo-mpc-qredo-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoMpcQredo({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoMpcQredoLogo />
    </Icon>
  );
}
