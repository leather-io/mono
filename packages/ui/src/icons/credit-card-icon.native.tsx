import CreditCard16 from '../assets/icons/credit-card-16-16.svg';
import CreditCard24 from '../assets/icons/credit-card-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const CreditCardIcon = createNativeIcon({
  icon: {
    small: CreditCard16,
    medium: CreditCard24,
  },
  displayName: 'CreditCard',
});
