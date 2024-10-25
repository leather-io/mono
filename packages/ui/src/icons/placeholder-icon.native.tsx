import { Component, forwardRef } from 'react';

import PlaceholderSmall from '../assets/icons/placeholder-16-16.svg';
import Placeholder from '../assets/icons/placeholder-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const PlaceholderIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <PlaceholderSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Placeholder />
    </Icon>
  );
});
