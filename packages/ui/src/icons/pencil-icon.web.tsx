import { forwardRef } from 'react';

import PencilSmall from '../assets/icons/pencil-16-16.svg';
import Pencil from '../assets/icons/pencil-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const PencilIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <PencilSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Pencil />
    </Icon>
  );
});
