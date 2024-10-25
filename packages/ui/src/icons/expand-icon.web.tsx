import { forwardRef } from 'react';

import ExpandSmall from '../assets/icons/expand-16-16.svg';
import Expand from '../assets/icons/expand-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const ExpandIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <ExpandSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Expand />
    </Icon>
  );
});
