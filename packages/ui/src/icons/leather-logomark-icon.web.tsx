import { forwardRef } from 'react';

import LeatherLogomark from '../assets/icons/leather-logomark.svg';
import { Icon, IconProps } from './icon/icon.web';

export const LeatherLogomarkIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ variant, ...props }, ref) => {
    return (
      <Icon ref={ref} {...props}>
        <LeatherLogomark />
      </Icon>
    );
  }
);
