import LeatherLettermark from '../assets/icons/leather-lettermark-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function LeatherLettermarkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <LeatherLettermark />
    </Icon>
  );
}
