import SquareLinesBottomSmall from '../assets/icons/square-lines-bottom-16-16.svg';
import SquareLinesBottom from '../assets/icons/square-lines-bottom-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function SquareLinesBottomIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <SquareLinesBottomSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <SquareLinesBottom />
    </Icon>
  );
}
