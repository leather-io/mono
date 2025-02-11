import Terminal16 from '../assets/icons/terminal-16-16.svg';
import Terminal24 from '../assets/icons/terminal-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const TerminalIcon = createNativeIcon({
  icon: {
    small: Terminal16,
    medium: Terminal24,
  },
  displayName: 'Terminal',
});
