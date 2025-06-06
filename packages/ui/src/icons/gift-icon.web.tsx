import Gift16 from '../assets/icons/gift-16-16.svg';
import Gift24 from '../assets/icons/gift-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const GiftIcon = createWebIcon({
  icon: {
    small: Gift16,
    medium: Gift24,
  },
  displayName: 'Gift',
});
