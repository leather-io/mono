import { forwardRef } from 'react';

import ExternalLinkSmall from '../assets/icons/external-link-16-16.svg';
import ExternalLink from '../assets/icons/external-link-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const ExternalLinkIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <ExternalLinkSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <ExternalLink />
      </Icon>
    );
  }
);

ExternalLinkIcon.displayName = 'ExternalLinkIcon';
