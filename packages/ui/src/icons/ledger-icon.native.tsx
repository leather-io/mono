import Ledger16 from '../assets/icons/ledger-16-16.svg';
import Ledger24 from '../assets/icons/ledger-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const LedgerIcon = createNativeIcon({
  icon: {
    small: Ledger16,
    medium: Ledger24,
  },
  displayName: 'Ledger',
});
