import ArrowLeftSmall from '../assets/icons/arrow-left-16-16.svg';
import ArrowLeft from '../assets/icons/arrow-left-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

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
