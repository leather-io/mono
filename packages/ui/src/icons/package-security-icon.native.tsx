import PackageSecurity16 from '../assets/icons/package-security-16-16.svg';
import PackageSecurity24 from '../assets/icons/package-security-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const PackageSecurityIcon = createNativeIcon({
  icon: {
    small: PackageSecurity16,
    medium: PackageSecurity24,
  },
  displayName: 'PackageSecurity',
});
