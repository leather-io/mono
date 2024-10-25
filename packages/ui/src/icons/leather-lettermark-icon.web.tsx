import { forwardRef } from 'react';

import LeatherLettermark from '../assets/icons/leather-lettermark-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const LeatherLettermarkIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ variant, ...props }, ref) => {
    return (
      <Icon ref={ref} {...props}>
        <LeatherLettermark />
      </Icon>
    );
  }
);
