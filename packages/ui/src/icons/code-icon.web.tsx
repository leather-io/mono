import { forwardRef } from 'react';

import CodeSmall from '../assets/icons/code-16-16.svg';
import Code from '../assets/icons/code-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const CodeIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <CodeSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Code />
    </Icon>
  );
});
