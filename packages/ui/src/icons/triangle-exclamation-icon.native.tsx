import TriangleExclamationSmall from '../assets/icons/triangle-exclamation-small.svg';
import TriangleExclamation from '../assets/icons/triangle-exclamation.svg';
import { Icon, IconProps } from './icon/icon.native';

export function TriangleExclamationIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <TriangleExclamationSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <TriangleExclamation />
    </Icon>
  );
}
