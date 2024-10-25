import { Component, forwardRef } from 'react';

import LeatherLettermark from '../assets/icons/leather-lettermark-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const LeatherLettermarkIcon = forwardRef<Component, IconProps>(
  ({ variant, ...props }, ref) => {
    return (
      <Icon ref={ref} {...props}>
        <LeatherLettermark />
      </Icon>
    );
  }
);
