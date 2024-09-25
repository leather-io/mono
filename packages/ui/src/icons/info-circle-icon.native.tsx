import InfoCircleSmall from '../assets/icons/info-circle-16-16.svg';
import InfoCircle from '../assets/icons/info-circle-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function InfoCircleIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <InfoCircleSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <InfoCircle />
    </Icon>
  );
}
