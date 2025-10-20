import Changelog16 from '../assets/icons/changelog-16-16.svg';
import Changelog24 from '../assets/icons/changelog-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const ChangelogIcon = createWebIcon({
  icon: {
    small: Changelog16,
    medium: Changelog24,
  },
  displayName: 'Changelog',
});
