import React from 'react';
import { SvgProps } from 'react-native-svg';

import { useTheme } from '@shopify/restyle';
import { Theme } from 'src/theme-native';

import { IconVariant } from './icon.shared';

export interface IconProps extends SvgProps {
  variant?: IconVariant;
}
export function Icon({ children, ...props }: IconProps) {
  const child = React.Children.only(children) as React.ReactElement;
  const theme = useTheme<Theme>();
  return (
    <>
      {React.cloneElement(child, {
        color: theme.colors['ink.action-primary-default'],
        ...props,
      })}
    </>
  );
}
