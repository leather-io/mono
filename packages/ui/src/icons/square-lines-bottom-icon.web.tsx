import { forwardRef } from 'react';

import SquareLinesBottomSmall from '../assets/icons/square-lines-bottom-16-16.svg';
import SquareLinesBottom from '../assets/icons/square-lines-bottom-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const SquareLinesBottomIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <SquareLinesBottomSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <SquareLinesBottom />
      </Icon>
    );
  }
);
