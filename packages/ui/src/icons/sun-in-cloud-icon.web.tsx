import SunInCloudSmall from '../assets/icons/sun-in-cloud-16-16.svg';
import SunInCloud from '../assets/icons/sun-in-cloud-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function SunInCloudIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <SunInCloudSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <SunInCloud />
    </Icon>
  );
}
