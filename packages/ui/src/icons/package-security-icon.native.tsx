import PackageSecuritySmall from '../assets/icons/package-security-16-16.svg';
import PackageSecurity from '../assets/icons/palette-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function PackageSecurityIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <PackageSecuritySmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <PackageSecurity />
    </Icon>
  );
}
