import AnimalEagle from '../../assets/icons/fee-animals/animal-eagle-32-32.svg';
import { createNativeIcon } from '../icon/create-icon.native';

export const AnimalEagleIcon = createNativeIcon({
  icon: {
    large: AnimalEagle,
  },
  defaultVariant: 'large',
  displayName: 'AnimalEagleIcon',
});
