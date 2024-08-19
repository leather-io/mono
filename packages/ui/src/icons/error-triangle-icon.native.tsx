import ErrorTriangleSmall from '../assets/icons/error-triangle-16-16.svg';
import ErrorTriangle from '../assets/icons/error-triangle-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function ErrorTriangleIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ErrorTriangleSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ErrorTriangle />
    </Icon>
  );
}
