import PassportSmall from '../assets/icons/passport-16-16.svg';
import Passport from '../assets/icons/passport-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function PassportIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <PassportSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Passport />
    </Icon>
  );
}
