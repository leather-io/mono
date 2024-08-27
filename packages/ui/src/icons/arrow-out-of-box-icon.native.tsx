import ArrowOutOfBoxSmall from '../assets/icons/arrow-out-of-box-16-16.svg';
import ArrowOutOfBox from '../assets/icons/arrow-out-of-box-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function ArrowOutOfBoxIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ArrowOutOfBoxSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ArrowOutOfBox />
    </Icon>
  );
}
