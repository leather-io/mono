import CopySmall from '../assets/icons/copy-16-16.svg';
import Copy from '../assets/icons/copy-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

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
