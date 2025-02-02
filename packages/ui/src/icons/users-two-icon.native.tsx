import UsersTwo16 from '../assets/icons/users-two-16-16.svg';
import UsersTwo24 from '../assets/icons/users-two-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const UsersTwoIcon = createNativeIcon({
  icon: {
    small: UsersTwo16,
    medium: UsersTwo24,
  },
  displayName: 'UsersTwo',
});
