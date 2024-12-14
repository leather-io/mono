import { forwardRef } from 'react';

import ExitSmall from '../assets/icons/exit-16-16.svg';
import Exit from '../assets/icons/exit-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const ExitIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <ExitSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Exit />
    </Icon>
  );
});

ExitIcon.displayName = 'ExitIcon';
