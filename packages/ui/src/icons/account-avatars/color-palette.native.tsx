import { Component, forwardRef } from 'react';

import ColorPalette from '../../assets/icons/account-avatars/color-palette-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const ColorPaletteIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <ColorPalette />
    </Icon>
  );
});
