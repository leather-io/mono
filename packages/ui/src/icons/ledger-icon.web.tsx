import LedgerSmall from '../assets/icons/ledger-16-16.svg';
import Ledger from '../assets/icons/ledger-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function LedgerIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <LedgerSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Ledger />
    </Icon>
  );
}
