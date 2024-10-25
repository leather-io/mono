import { Component, forwardRef } from 'react';

import CloseSmall from '../assets/icons/close-16-16.svg';
import Close from '../assets/icons/close-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const CloseIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <CloseSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Close />
    </Icon>
  );
});
