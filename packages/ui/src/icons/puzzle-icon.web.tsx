import Puzzle16 from '../assets/icons/puzzle-16-16.svg';
import Puzzle24 from '../assets/icons/puzzle-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const PuzzleIcon = createWebIcon({
  icon: {
    small: Puzzle16,
    medium: Puzzle24,
  },
  displayName: 'Puzzle',
});
