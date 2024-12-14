import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import ColorPalette from '../../assets/icons/account-avatars/color-palette-24-24.svg';
import { Icon } from '../icon/icon.native';

export const ColorPaletteIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <ColorPalette />
    </Icon>
  );
});

ColorPaletteIcon.displayName = 'ColorPaletteIcon';
