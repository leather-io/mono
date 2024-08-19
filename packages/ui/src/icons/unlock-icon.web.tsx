import UnlockSmall from '../assets/icons/unlock-16-16.svg';
import Unlock from '../assets/icons/unlock-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function UnlockIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <UnlockSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Unlock />
    </Icon>
  );
}
