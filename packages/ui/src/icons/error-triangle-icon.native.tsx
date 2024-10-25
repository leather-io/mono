import { Component, forwardRef } from 'react';

import ErrorTriangleSmall from '../assets/icons/error-triangle-16-16.svg';
import ErrorTriangle from '../assets/icons/error-triangle-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const ErrorTriangleIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <ErrorTriangleSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <ErrorTriangle />
    </Icon>
  );
});
