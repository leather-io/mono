import { Component, forwardRef } from 'react';

import PaperPlaneSmall from '../assets/icons/paper-plane-16-16.svg';
import PaperPlane from '../assets/icons/paper-plane-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const PaperPlaneIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <PaperPlaneSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <PaperPlane />
    </Icon>
  );
});
