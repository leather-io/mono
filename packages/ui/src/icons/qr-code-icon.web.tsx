import QrCodeSmall from '../assets/icons/qr-code-16-16.svg';
import QrCode from '../assets/icons/qr-code-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function QrCodeIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <QrCodeSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <QrCode />
    </Icon>
  );
}
