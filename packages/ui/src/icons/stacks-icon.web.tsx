import Stacks16 from '../assets/icons/stacks-16-16.svg';
import Stacks24 from '../assets/icons/stacks-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const StacksIcon = createWebIcon({
  icon: {
    small: Stacks16,
    medium: Stacks24,
  },
  displayName: 'Stacks',
});
