import CloudOffSmall from '../assets/icons/cloud-off-16-16.svg';
import CloudOff from '../assets/icons/cloud-off-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function CloudOffIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <CloudOffSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <CloudOff />
    </Icon>
  );
}
