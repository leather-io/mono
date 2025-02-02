import Function16 from '../assets/icons/function-16-16.svg';
import Function24 from '../assets/icons/function-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const FunctionIcon = createNativeIcon({
  icon: {
    small: Function16,
    medium: Function24,
  },
  displayName: 'Function',
});
