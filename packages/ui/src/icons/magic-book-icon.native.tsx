import { Component, forwardRef } from 'react';

import MagicBookSmall from '../assets/icons/magic-book-16-16.svg';
import MagicBook from '../assets/icons/magic-book-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const MagicBookIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <MagicBookSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <MagicBook />
    </Icon>
  );
});

MagicBookIcon.displayName = 'MagicBookIcon';
