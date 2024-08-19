import ErrorCircleSmall from '../assets/icons/error-circle-16-16.svg';
import ErrorCircle from '../assets/icons/error-circle-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function ErrorCircleIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ErrorCircleSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ErrorCircle />
    </Icon>
  );
}
