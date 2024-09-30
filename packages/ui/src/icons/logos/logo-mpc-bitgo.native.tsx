import LogoMpcBitgoLogo from '../../assets/icons/logos/logo-mpc-bitgo-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoMpcBitgo({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoMpcBitgoLogo />
    </Icon>
  );
}
