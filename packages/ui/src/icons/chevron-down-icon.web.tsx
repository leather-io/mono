import { forwardRef } from 'react';

import ChevronDownSmall from '../assets/icons/chevron-down-16-16.svg';
import ChevronDown from '../assets/icons/chevron-down-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const ChevronDownIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <ChevronDownSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <ChevronDown />
      </Icon>
    );
  }
);

ChevronDownIcon.displayName = 'ChevronDownIcon';
