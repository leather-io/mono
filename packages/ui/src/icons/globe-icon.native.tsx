import { Component, forwardRef } from 'react';

import GlobeSmall from '../assets/icons/globe-16-16.svg';
import Globe from '../assets/icons/globe-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const GlobeIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <GlobeSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Globe />
    </Icon>
  );
});
