import { Component, forwardRef } from 'react';

import PaletteSmall from '../assets/icons/palette-16-16.svg';
import Palette from '../assets/icons/palette-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const PaletteIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <PaletteSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Palette />
    </Icon>
  );
});
