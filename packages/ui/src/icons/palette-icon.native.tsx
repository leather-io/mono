import PaletteSmall from '../assets/icons/palette-16-16.svg';
import Palette from '../assets/icons/palette-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function PaletteIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <PaletteSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <Palette />
    </Icon>
  );
}
