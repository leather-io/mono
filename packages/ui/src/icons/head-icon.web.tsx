import { forwardRef } from 'react';

import HeadSmall from '../assets/icons/head-16-16.svg';
import Head from '../assets/icons/head-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const HeadIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <HeadSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Head />
    </Icon>
  );
});

HeadIcon.displayName = 'HeadIcon';
