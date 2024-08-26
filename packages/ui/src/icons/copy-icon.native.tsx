import CopySmall from '../assets/icons/copy-small.svg';
import Copy from '../assets/icons/copy.svg';
import { Icon, IconProps } from './icon/icon.native';

export function CopyIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <CopySmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Copy />
    </Icon>
  );
}
