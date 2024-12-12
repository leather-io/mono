import { SVGProps, forwardRef } from 'react';

import LeatherLogomark from '../assets/icons/leather-logomark.svg';
import { Icon } from './icon/icon.web';

export const LeatherLogomarkIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
    return (
      <Icon ref={ref} {...props}>
        <LeatherLogomark />
      </Icon>
    );
  }
);
