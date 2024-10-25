import { forwardRef } from 'react';

import MegaphoneSmall from '../assets/icons/megaphone-16-16.svg';
import Megaphone from '../assets/icons/megaphone-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const MegaphoneIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <MegaphoneSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Megaphone />
    </Icon>
  );
});
