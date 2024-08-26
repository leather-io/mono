import ColorSwatchSmall from '../assets/icons/color-swatch-small.svg';
import ColorSwatch from '../assets/icons/color-swatch.svg';
import { Icon, IconProps } from './icon/icon.native';

export function ColorSwatchIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <ColorSwatchSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <ColorSwatch />
    </Icon>
  );
}
