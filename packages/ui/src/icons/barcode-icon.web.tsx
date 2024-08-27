import BarcodeSmall from '../assets/icons/barcode-16-16.svg';
import Barcode from '../assets/icons/barcode-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function BarcodeIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <BarcodeSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Barcode />
    </Icon>
  );
}
