import { Component, forwardRef } from 'react';

import KeyholeSmall from '../assets/icons/keyhole-16-16.svg';
import Keyhole from '../assets/icons/keyhole-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const KeyholeIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <KeyholeSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Keyhole />
    </Icon>
  );
});

KeyholeIcon.displayName = 'KeyholeIcon';
