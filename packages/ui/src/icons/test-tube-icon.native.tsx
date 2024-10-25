import { Component, forwardRef } from 'react';

import TestTubeSmall from '../assets/icons/test-tube-16-16.svg';
import TestTube from '../assets/icons/test-tube-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const TestTubeIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <TestTubeSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <TestTube />
    </Icon>
  );
});
