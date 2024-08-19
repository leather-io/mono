import MegaphoneSmall from '../assets/icons/megaphone-16-16.svg';
import Megaphone from '../assets/icons/megaphone-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function MegaphoneIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <MegaphoneSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Megaphone />
    </Icon>
  );
}
