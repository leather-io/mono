import GraduateCapSmall from '../assets/icons/graduate-cap-16-16.svg';
import GraduateCap from '../assets/icons/graduate-cap-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function GraduateCapIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <GraduateCapSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <GraduateCap />
    </Icon>
  );
}
