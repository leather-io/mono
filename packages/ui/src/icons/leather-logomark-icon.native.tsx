import LeatherLogomark from '../assets/icons/leather-logomark.svg';
import { Icon, IconProps } from './icon/icon.native';

export function LeatherLogomarkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <LeatherLogomark />
    </Icon>
  );
}
