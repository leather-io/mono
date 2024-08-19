import BarsTwoSmall from '../assets/icons/bars-two-16-16.svg';
import BarsTwo from '../assets/icons/bars-two-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function BarsTwoIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <BarsTwoSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <BarsTwo />
    </Icon>
  );
}
