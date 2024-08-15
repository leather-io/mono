import Console from '../assets/icons/console.svg';
import { Icon, IconProps } from './icon/icon.native';

export function ConsoleIcon({ variant, ...props }: IconProps) {
  // TODO: Need svg for small variant
  return (
    <Icon {...props}>
      <Console />
    </Icon>
  );
}
