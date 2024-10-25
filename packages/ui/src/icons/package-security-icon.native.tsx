import { Component, forwardRef } from 'react';

import PackageSecuritySmall from '../assets/icons/package-security-16-16.svg';
import PackageSecurity from '../assets/icons/package-security-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const PackageSecurityIcon = forwardRef<Component, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <PackageSecuritySmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <PackageSecurity />
      </Icon>
    );
  }
);
