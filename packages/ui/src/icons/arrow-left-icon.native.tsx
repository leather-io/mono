import ArrowLeftSmall from '../assets/icons/arrow-left-small.svg';
import ArrowLeft from '../assets/icons/arrow-left.svg';
import { Icon, IconProps } from './icon/icon.native';

export function ArrowLeftIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ArrowLeftSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ArrowLeft />
    </Icon>
  );
}
