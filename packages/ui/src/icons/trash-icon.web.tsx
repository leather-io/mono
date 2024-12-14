import { forwardRef } from 'react';

import TrashSmall from '../assets/icons/trash-16-16.svg';
import Trash from '../assets/icons/trash-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const TrashIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <TrashSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Trash />
    </Icon>
  );
});

TrashIcon.displayName = 'TrashIcon';
