import QuestionCircle16 from '../assets/icons/question-circle-16-16.svg';
import QuestionCircle24 from '../assets/icons/question-circle-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const QuestionCircleIcon = createNativeIcon({
  icon: {
    small: QuestionCircle16,
    medium: QuestionCircle24,
  },
  displayName: 'QuestionCircle',
});
