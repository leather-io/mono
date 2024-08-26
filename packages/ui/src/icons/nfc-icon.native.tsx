import NfcSmall from '../assets/icons/nfc-small.svg';
import Nfc from '../assets/icons/nfc.svg';
import { Icon, IconProps } from './icon/icon.native';

export function NfcIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <NfcSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Nfc />
    </Icon>
  );
}
