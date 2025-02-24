import PlaygroundForms16 from '../assets/icons/playground-forms-16-16.svg';
import PlaygroundForms24 from '../assets/icons/playground-forms-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const PlaygroundFormsIcon = createWebIcon({
  icon: {
    small: PlaygroundForms16,
    medium: PlaygroundForms24,
  },
  displayName: 'PlaygroundForms',
});
