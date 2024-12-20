import { forwardRef } from 'react';

import BoxedCatUnlocked from '../assets/icons/boxed-cat-unlocked-24x24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const BoxedCatUnlockedIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <Icon ref={ref} {...props}>
    <BoxedCatUnlocked />
  </Icon>
));
