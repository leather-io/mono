import LogoHardwareLedgerLogo from '../../assets/icons/logos/logo-hardware-ledger-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export function LogoHardwareLedger({ variant, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <LogoHardwareLedgerLogo />
    </Icon>
  );
}
