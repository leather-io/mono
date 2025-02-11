import SettingsGear16 from '../assets/icons/settings-gear-16-16.svg';
import SettingsGear24 from '../assets/icons/settings-gear-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const SettingsGearIcon = createNativeIcon({
  icon: {
    small: SettingsGear16,
    medium: SettingsGear24,
  },
  displayName: 'SettingsGear',
});
