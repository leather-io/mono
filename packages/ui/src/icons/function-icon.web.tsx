import { forwardRef } from 'react';

import FunctionSmall from '../assets/icons/function-16-16.svg';
import Function from '../assets/icons/function-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const FunctionIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <FunctionSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Function />
    </Icon>
  );
});
