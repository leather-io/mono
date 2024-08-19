import CircleSmall from '../assets/icons/circle-16-16.svg';
import Circle from '../assets/icons/circle-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function CircleIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <CircleSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Circle />
    </Icon>
  );
}
