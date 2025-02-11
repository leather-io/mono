import Code16 from '../assets/icons/code-16-16.svg';
import Code24 from '../assets/icons/code-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const CodeIcon = createWebIcon({
  icon: {
    small: Code16,
    medium: Code24,
  },
  displayName: 'Code',
});
