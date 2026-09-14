import Vault16 from '../assets/icons/vault-16-16.svg';
import Vault24 from '../assets/icons/vault-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const VaultIcon = createNativeIcon({
  icon: {
    small: Vault16,
    medium: Vault24,
  },
  displayName: 'Vault',
});
