import Inbox16 from '../assets/icons/inbox-16-16.svg';
import Inbox24 from '../assets/icons/inbox-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const InboxIcon = createWebIcon({
  icon: {
    small: Inbox16,
    medium: Inbox24,
  },
  displayName: 'Inbox',
});
