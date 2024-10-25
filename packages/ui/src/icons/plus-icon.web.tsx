import { forwardRef } from 'react';

import PlusSmall from '../assets/icons/plus-16-16.svg';
import Plus from '../assets/icons/plus-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const PlusIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <PlusSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Plus />
    </Icon>
  );
});
