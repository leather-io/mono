import PlaceholderSmall from '../assets/icons/placeholder-small.svg';
import Placeholder from '../assets/icons/placeholder.svg';
import { Icon, IconProps } from './icon/icon.native';

export function PlaceholderIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <PlaceholderSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Placeholder />
    </Icon>
  );
}
