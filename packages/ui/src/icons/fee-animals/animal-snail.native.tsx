import AnimalSnail from '../../assets/icons/fee-animals/animal-snail-32-32.svg';
import { createNativeIcon } from '../icon/create-icon.native';

export const AnimalSnailIcon = createNativeIcon({
  icon: {
    large: AnimalSnail,
  },
  defaultVariant: 'large',
  displayName: 'AnimalSnailIcon',
});
