import ArrowsRepeatLeftRightSmall from '../assets/icons/arrows-repeat-left-right-16-16.svg';
import ArrowsRepeatLeftRight from '../assets/icons/arrows-repeat-left-right-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function ArrowsRepeatLeftRightIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ArrowsRepeatLeftRightSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ArrowsRepeatLeftRight />
    </Icon>
  );
}
