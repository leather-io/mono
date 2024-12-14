import { Component, forwardRef } from 'react';

import SettingsGearSmall from '../assets/icons/settings-gear-16-16.svg';
import SettingsGear from '../assets/icons/settings-gear-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const SettingsGearIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <SettingsGearSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <SettingsGear />
    </Icon>
  );
});

SettingsGearIcon.displayName = 'SettingsGearIcon';
