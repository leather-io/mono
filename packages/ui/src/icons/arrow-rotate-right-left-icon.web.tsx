import ArrowRotateRightLeftSmall from '../assets/icons/arrow-rotate-right-left-16-16.svg';
import ArrowRotateRightLeft from '../assets/icons/arrow-rotate-right-left-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function ArrowRotateRightLeftIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ArrowRotateRightLeftSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ArrowRotateRightLeft />
    </Icon>
  );
}
