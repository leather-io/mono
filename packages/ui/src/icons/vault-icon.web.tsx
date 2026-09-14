import Vault16 from '../assets/icons/vault-16-16.svg';
import Vault24 from '../assets/icons/vault-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const VaultIcon = createWebIcon({
  icon: {
    small: Vault16,
    medium: Vault24,
  },
  displayName: 'Vault',
});
