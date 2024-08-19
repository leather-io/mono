import PencilSmall from '../assets/icons/pencil-16-16.svg';
import Pencil from '../assets/icons/pencil-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function PencilIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <PencilSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Pencil />
    </Icon>
  );
}
