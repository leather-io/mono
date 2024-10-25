import { forwardRef } from 'react';

import StarSmall from '../assets/icons/star-16-16.svg';
import Star from '../assets/icons/star-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const StarIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <StarSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Star />
    </Icon>
  );
});
