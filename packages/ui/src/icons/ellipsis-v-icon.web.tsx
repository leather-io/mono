import { forwardRef } from 'react';

import EllipsisVSmall from '../assets/icons/ellipsis-v-16-16.svg';
import EllipsisV from '../assets/icons/ellipsis-v-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const EllipsisVIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <EllipsisVSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <EllipsisV />
    </Icon>
  );
});
