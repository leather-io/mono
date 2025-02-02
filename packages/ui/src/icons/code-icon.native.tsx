import Code16 from '../assets/icons/code-16-16.svg';
import Code24 from '../assets/icons/code-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const CodeIcon = createNativeIcon({
  icon: {
    small: Code16,
    medium: Code24,
  },
  displayName: 'Code',
});
