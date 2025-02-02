import Ledger16 from '../assets/icons/ledger-16-16.svg';
import Ledger24 from '../assets/icons/ledger-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const LedgerIcon = createWebIcon({
  icon: {
    small: Ledger16,
    medium: Ledger24,
  },
  displayName: 'Ledger',
});
