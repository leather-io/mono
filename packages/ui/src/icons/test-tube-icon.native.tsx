import TestTube16 from '../assets/icons/test-tube-16-16.svg';
import TestTube24 from '../assets/icons/test-tube-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const TestTubeIcon = createNativeIcon({
  icon: {
    small: TestTube16,
    medium: TestTube24,
  },
  displayName: 'TestTube',
});
