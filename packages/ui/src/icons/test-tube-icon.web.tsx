import TestTube16 from '../assets/icons/test-tube-16-16.svg';
import TestTube24 from '../assets/icons/test-tube-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const TestTubeIcon = createWebIcon({
  icon: {
    small: TestTube16,
    medium: TestTube24,
  },
  displayName: 'TestTube',
});
