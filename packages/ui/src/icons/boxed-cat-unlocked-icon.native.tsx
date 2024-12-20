import { Component, forwardRef } from 'react';

import BoxedCatUnlocked from '../assets/icons/boxed-cat-unlocked-24x24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const BoxedCatUnlockedIcon = forwardRef<Component, IconProps>((props, ref) => (
  <Icon ref={ref} {...props}>
    <BoxedCatUnlocked />
  </Icon>
));
