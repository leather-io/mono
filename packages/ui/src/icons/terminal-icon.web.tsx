import { forwardRef } from 'react';

import TerminalSmall from '../assets/icons/terminal-16-16.svg';
import Terminal from '../assets/icons/terminal-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const TerminalIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <TerminalSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Terminal />
    </Icon>
  );
});
