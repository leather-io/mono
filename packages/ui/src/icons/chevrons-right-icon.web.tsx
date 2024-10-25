import { forwardRef } from 'react';

import ChevronsRightSmall from '../assets/icons/chevrons-right-16-16.svg';
import ChevronsRight from '../assets/icons/chevrons-right-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const ChevronsRightIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <ChevronsRightSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <ChevronsRight />
      </Icon>
    );
  }
);
