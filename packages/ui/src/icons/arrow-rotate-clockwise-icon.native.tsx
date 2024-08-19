import ReloadSmall from '../assets/icons/arrow-rotate-clockwise-16-16.svg';
import Reload from '../assets/icons/arrow-rotate-clockwise-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function ArrowRotateClockwiseIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ReloadSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Reload />
    </Icon>
  );
}
