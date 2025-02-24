import SettingsSliderThree16 from '../assets/icons/settings-slider-three-16-16.svg';
import SettingsSliderThree24 from '../assets/icons/settings-slider-three-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const SettingsSliderThreeIcon = createNativeIcon({
  icon: {
    small: SettingsSliderThree16,
    medium: SettingsSliderThree24,
  },
  displayName: 'SettingsSliderThree',
});
