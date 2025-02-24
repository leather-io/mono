import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import { useTheme } from '@shopify/restyle';

import LeatherLogomark from '../assets/icons/leather-logomark.svg';
import { Theme } from '../theme-native';

export const LeatherLogomarkIcon = forwardRef<Component, SvgProps>((props, ref) => {
  const theme = useTheme<Theme>();

  return (
    <LeatherLogomark ref={ref} color={theme.colors['ink.action-primary-default']} {...props} />
  );
});

LeatherLogomarkIcon.displayName = 'LeatherLogomarkIcon';
