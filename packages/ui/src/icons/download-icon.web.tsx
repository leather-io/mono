import { forwardRef } from 'react';

import DownloadSmall from '../assets/icons/download-16-16.svg';
import Download from '../assets/icons/download-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const DownloadIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <DownloadSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Download />
    </Icon>
  );
});
