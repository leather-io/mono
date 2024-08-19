import ArrowRotateClockwiseSmall from '../assets/icons/arrow-rotate-clockwise-16-16.svg';
import ArrowRotateClockwise from '../assets/icons/arrow-rotate-clockwise-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function ArrowRotateClockwiseIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ArrowRotateClockwiseSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ArrowRotateClockwise />
    </Icon>
  );
}
