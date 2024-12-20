import { SVGProps, forwardRef } from 'react';

import { token } from 'leather-styles/tokens';

import LeatherLogomark from '../assets/icons/leather-logomark.svg';

export const LeatherLogomarkIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
    return (
      <LeatherLogomark ref={ref} color={token('colors.ink.action-primary-default')} {...props} />
    );
  }
);

LeatherLogomarkIcon.displayName = 'LeatherLogomarkIcon';
