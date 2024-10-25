import { forwardRef } from 'react';

import ArrowLeftSmall from '../assets/icons/arrow-left-16-16.svg';
import ArrowLeft from '../assets/icons/arrow-left-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const ArrowLeftIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <ArrowLeftSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <ArrowLeft />
    </Icon>
  );
});
