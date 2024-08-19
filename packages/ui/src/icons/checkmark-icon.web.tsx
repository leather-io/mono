import CheckmarkSmall from '../assets/icons/checkmark-16-16.svg';
import Checkmark from '../assets/icons/checkmark-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function CheckmarkIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <CheckmarkSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Checkmark />
    </Icon>
  );
}
