import { Component, forwardRef } from 'react';

import BoxedCatLocked from '../assets/icons/boxed-cat-locked-24x24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const BoxedCatLockedIcon = forwardRef<Component, IconProps>((props, ref) => (
  <Icon ref={ref} {...props}>
    <BoxedCatLocked />
  </Icon>
));

BoxedCatLockedIcon.displayName = 'BoxedCatLockedIcon';
