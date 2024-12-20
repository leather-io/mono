import { forwardRef } from 'react';

import BoxedCatLocked from '../assets/icons/boxed-cat-locked-24x24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const BoxedCatLockedIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <Icon ref={ref} {...props}>
    <BoxedCatLocked />
  </Icon>
));
