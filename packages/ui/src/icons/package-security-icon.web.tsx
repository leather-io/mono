import PackageSecurity16 from '../assets/icons/package-security-16-16.svg';
import PackageSecurity24 from '../assets/icons/package-security-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const PackageSecurityIcon = createWebIcon({
  icon: {
    small: PackageSecurity16,
    medium: PackageSecurity24,
  },
  displayName: 'PackageSecurity',
});
