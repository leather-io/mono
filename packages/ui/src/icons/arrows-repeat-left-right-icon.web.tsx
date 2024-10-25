import { forwardRef } from 'react';

import ArrowsRepeatLeftRightSmall from '../assets/icons/arrows-repeat-left-right-16-16.svg';
import ArrowsRepeatLeftRight from '../assets/icons/arrows-repeat-left-right-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const ArrowsRepeatLeftRightIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <ArrowsRepeatLeftRightSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <ArrowsRepeatLeftRight />
      </Icon>
    );
  }
);
