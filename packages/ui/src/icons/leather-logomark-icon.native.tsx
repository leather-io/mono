import { forwardRef } from 'react';
import { type Svg, type SvgProps } from 'react-native-svg';

import { useTheme } from '@shopify/restyle';

import LeatherLogomark from '../assets/icons/leather-logomark.svg';
import { type Theme } from '../theme-native';

export const LeatherLogomarkIcon = forwardRef<Svg, SvgProps>((props, ref) => {
  const theme = useTheme<Theme>();

  return (
    <LeatherLogomark
      ref={ref}
      width={86}
      height={19}
      color={theme.colors['ink.action-primary-default']}
      {...props}
    />
  );
});

LeatherLogomarkIcon.displayName = 'LeatherLogomarkIcon';
