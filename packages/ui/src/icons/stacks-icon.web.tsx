import { forwardRef } from 'react';

import StacksSmall from '../assets/icons/stacks-16-16.svg';
import Stacks from '../assets/icons/stacks-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const StacksIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <StacksSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Stacks />
    </Icon>
  );
});

StacksIcon.displayName = 'StacksIcon';
