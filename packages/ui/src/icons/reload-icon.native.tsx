import ReloadSmall from '../assets/icons/reload-small.svg';
import Reload from '../assets/icons/reload.svg';
import { Icon, IconProps } from './icon/icon.native';

export function ReloadIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ReloadSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Reload />
    </Icon>
  );
}
