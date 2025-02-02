import AnimalRabbit from '../../assets/icons/fee-animals/animal-rabbit-32-32.svg';
import { createNativeIcon } from '../icon/create-icon.native';

export const AnimalRabbitIcon = createNativeIcon({
  icon: {
    large: AnimalRabbit,
  },
  defaultVariant: 'large',
  displayName: 'AnimalRabbitIcon',
});
