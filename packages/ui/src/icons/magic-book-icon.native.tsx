import MagicBookSmall from '../assets/icons/magic-book-16-16.svg';
import MagicBook from '../assets/icons/magic-book-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function MagicBookIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <MagicBookSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <MagicBook />
    </Icon>
  );
}
