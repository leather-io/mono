import Changelog16 from '../assets/icons/changelog-16-16.svg';
import Changelog24 from '../assets/icons/changelog-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const ChangelogIcon = createNativeIcon({
  icon: {
    small: Changelog16,
    medium: Changelog24,
  },
  displayName: 'Changelog',
});
