import EllipsisHSmall from '../assets/icons/ellipsis-h-16-16.svg';
import EllipsisH from '../assets/icons/ellipsis-h-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function EllipsisHIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <EllipsisHSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <EllipsisH />
    </Icon>
  );
}
