import LogoMpcPortalLogo from '../../assets/icons/logos/logo-mpc-portal-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoMpcPortal({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoMpcPortalLogo />
    </Icon>
  );
}
