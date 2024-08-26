import EllipsisHSmall from '../assets/icons/ellipsis-h-small.svg';
import EllipsisH from '../assets/icons/ellipsis-h.svg';
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
