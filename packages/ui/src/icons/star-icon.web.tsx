import StarSmall from '../assets/icons/star-16-16.svg';
import Star from '../assets/icons/star-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export function StarIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <StarSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Star />
    </Icon>
  );
}
