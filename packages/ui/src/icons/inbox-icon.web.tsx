import { forwardRef } from 'react';

import InboxSmall from '../assets/icons/inbox-16-16.svg';
import Inbox from '../assets/icons/inbox-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const InboxIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <InboxSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Inbox />
    </Icon>
  );
});

InboxIcon.displayName = 'InboxIcon';
