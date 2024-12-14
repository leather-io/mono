import { Component, forwardRef } from 'react';

import PlaygroundFormsSmall from '../assets/icons/playground-forms-16-16.svg';
import PlaygroundForms from '../assets/icons/playground-forms-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const PlaygroundFormsIcon = forwardRef<Component, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <PlaygroundFormsSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <PlaygroundForms />
      </Icon>
    );
  }
);

PlaygroundFormsIcon.displayName = 'PlaygroundFormsIcon';
