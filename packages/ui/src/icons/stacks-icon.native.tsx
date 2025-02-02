import Stacks16 from '../assets/icons/stacks-16-16.svg';
import Stacks24 from '../assets/icons/stacks-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const StacksIcon = createNativeIcon({
  icon: {
    small: Stacks16,
    medium: Stacks24,
  },
  displayName: 'Stacks',
});
