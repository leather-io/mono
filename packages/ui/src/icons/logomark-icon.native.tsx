import Logomark from '../assets/icons/logomark.svg';
import { Icon, IconProps } from './icon/icon.native';

export function LogomarkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Logomark />
    </Icon>
  );
}
