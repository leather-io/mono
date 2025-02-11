import PlaygroundForms16 from '../assets/icons/playground-forms-16-16.svg';
import PlaygroundForms24 from '../assets/icons/playground-forms-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const PlaygroundFormsIcon = createNativeIcon({
  icon: {
    small: PlaygroundForms16,
    medium: PlaygroundForms24,
  },
  displayName: 'PlaygroundForms',
});
