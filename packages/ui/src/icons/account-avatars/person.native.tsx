import Person from '../../assets/icons/account-avatars/person-24-24.svg';
import { createNativeIcon } from '../icon/create-icon.native';

export const PersonIcon = createNativeIcon({
  icon: {
    medium: Person,
  },
  displayName: 'PersonIcon',
});
