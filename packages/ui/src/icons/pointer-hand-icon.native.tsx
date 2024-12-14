import { Component, forwardRef } from 'react';

import PointerHandSmall from '../assets/icons/pointer-hand-16-16.svg';
import PointerHand from '../assets/icons/pointer-hand-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const PointerHandIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <PointerHandSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <PointerHand />
    </Icon>
  );
});

PointerHandIcon.displayName = 'PointerHandIcon';
