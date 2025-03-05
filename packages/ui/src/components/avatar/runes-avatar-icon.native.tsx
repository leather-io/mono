import React from 'react';
import Svg, { Rect } from 'react-native-svg';

import { ThemeVariant } from 'src/theme-native/theme';

import { colorThemes } from '@leather.io/tokens';

import { Avatar } from './avatar.native';

interface RunesAvatarIconProps {
  theme: ThemeVariant;
}
export function RunesAvatarIcon({ theme }: RunesAvatarIconProps) {
  {
    /* 
          LEA-2017 FIXME: tokens not working e.g. fill={token('colors.ink.background-primary')}
          I need to confirm with Design if this is the correct approach
          will ask Design to provide an SVG for the runes avatar icon
          */
  }
  const darkFill =
    theme === 'light'
      ? colorThemes.base['ink.background-primary']
      : colorThemes.dark['ink.background-primary'];
  const lightFill =
    theme === 'light'
      ? colorThemes.base['ink.action-primary-default']
      : colorThemes.dark['ink.action-primary-default'];
  return (
    <Avatar
      outlineColor="ink.border-transparent"
      icon={
        <Svg width="100%" height="100%" viewBox="0 0 32 32" fill="none">
          <Rect width="32" height="32" rx="16" fill={darkFill} />
          <Rect width="32" height="32" fill={lightFill} />
          <Rect x="4" y="4" width="24" height="24" fill={darkFill} />
          <Rect x="10" y="10" width="12" height="12" fill={lightFill} />
        </Svg>
      }
    />
  );
}
