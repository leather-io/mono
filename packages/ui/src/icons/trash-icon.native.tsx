import TrashSmall from '../assets/icons/trash-16-16.svg';
import Trash from '../assets/icons/trash-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function TrashIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <TrashSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Trash />
    </Icon>
  );
}
