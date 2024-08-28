import GlobeTiltedSmall from '../assets/icons/globe-tilted-16-16.svg';
import GlobeTilted from '../assets/icons/globe-tilted-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function GlobeTiltedIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <GlobeTiltedSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <GlobeTilted />
    </Icon>
  );
}
