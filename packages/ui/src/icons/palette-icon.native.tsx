import Palette16 from '../assets/icons/palette-16-16.svg';
import Palette24 from '../assets/icons/palette-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const PaletteIcon = createNativeIcon({
  icon: {
    small: Palette16,
    medium: Palette24,
  },
  displayName: 'Palette',
});
