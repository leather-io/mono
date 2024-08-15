import Lettermark from '../assets/icons/lettermark.svg';
import { Icon, IconProps } from './icon/icon.native';

export function LettermarkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <Lettermark />
    </Icon>
  );
}
