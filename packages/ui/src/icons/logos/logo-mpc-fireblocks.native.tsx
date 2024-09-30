import LogoMpcFireblocksLogo from '../../assets/icons/logos/logo-mpc-fireblocks-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoMpcFireblocks({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoMpcFireblocksLogo />
    </Icon>
  );
}
