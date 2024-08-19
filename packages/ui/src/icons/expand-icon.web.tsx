import ExpandSmall from '../assets/icons/expand-16-16.svg';
import Expand from '../assets/icons/expand-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function ExpandIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ExpandSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Expand />
    </Icon>
  );
}
