import GlobeSmall from '../assets/icons/globe-16-16.svg';
import Globe from '../assets/icons/globe-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function GlobeIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <GlobeSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Globe />
    </Icon>
  );
}
