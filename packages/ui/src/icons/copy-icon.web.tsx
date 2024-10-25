import { forwardRef } from 'react';

import CopySmall from '../assets/icons/copy-16-16.svg';
import Copy from '../assets/icons/copy-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const CopyIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <CopySmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Copy />
    </Icon>
  );
});
