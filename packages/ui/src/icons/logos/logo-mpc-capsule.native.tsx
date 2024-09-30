import LogoMpcCapsuleLogo from '../../assets/icons/logos/logo-mpc-capsule-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoMpcCapsule({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoMpcCapsuleLogo />
    </Icon>
  );
}
