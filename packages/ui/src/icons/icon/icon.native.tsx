import React, { Children, Component, ReactElement, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import { useTheme } from '@shopify/restyle';

import { Theme } from '../../theme-native';
import { IconVariant } from './icon.shared';

export interface IconProps extends SvgProps {
  variant?: IconVariant;
}
export const Icon = forwardRef<Component, IconProps>(({ children, ...props }, ref) => {
  const child = Children.only(children) as ReactElement;
  const theme = useTheme<Theme>();

  return (
    <>
      {React.cloneElement(child, {
        color: theme.colors['ink.action-primary-default'],
        ref,
        ...props,
      })}
    </>
  );
});
