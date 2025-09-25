import Feed16 from '../assets/icons/feed-16-16.svg';
import Feed24 from '../assets/icons/feed-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const FeedIcon = createWebIcon({
  icon: {
    small: Feed16,
    medium: Feed24,
  },
  displayName: 'Feed',
});
