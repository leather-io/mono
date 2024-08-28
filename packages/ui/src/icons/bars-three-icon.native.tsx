import BarsThreeSmall from '../assets/icons/bars-three-16-16.svg';
import BarsThree from '../assets/icons/bars-three-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function BarsThreeIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <BarsThreeSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <BarsThree />
    </Icon>
  );
}
