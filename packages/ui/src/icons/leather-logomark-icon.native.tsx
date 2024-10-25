import { Component, forwardRef } from 'react';

import LeatherLogomark from '../assets/icons/leather-logomark.svg';
import { Icon, IconProps } from './icon/icon.native';

export const LeatherLogomarkIcon = forwardRef<Component, IconProps>(
  ({ variant, ...props }, ref) => {
    return (
      <Icon ref={ref} {...props}>
        <LeatherLogomark />
      </Icon>
    );
  }
);
