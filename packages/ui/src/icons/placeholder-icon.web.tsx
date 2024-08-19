import PlaceholderSmall from '../assets/icons/placeholder-16-16.svg';
import Placeholder from '../assets/icons/placeholder-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

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
