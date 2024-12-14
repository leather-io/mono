import { Component, forwardRef } from 'react';

import SettingsSliderThreeSmall from '../assets/icons/settings-slider-three-16-16.svg';
import SettingsSliderThree from '../assets/icons/settings-slider-three-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const SettingsSliderThreeIcon = forwardRef<Component, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <SettingsSliderThreeSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <SettingsSliderThree />
      </Icon>
    );
  }
);

SettingsSliderThreeIcon.displayName = 'SettingsSliderThreeIcon';
