import EllipsisVSmall from '../assets/icons/ellipsis-v-16-16.svg';
import EllipsisV from '../assets/icons/ellipsis-v-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function EllipsisVIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <EllipsisVSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <EllipsisV />
    </Icon>
  );
}
