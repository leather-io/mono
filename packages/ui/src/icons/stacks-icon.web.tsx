import StacksSmall from '../assets/icons/stacks-16-16.svg';
import Stacks from '../assets/icons/stacks-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function StacksIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <StacksSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Stacks />
    </Icon>
  );
}
