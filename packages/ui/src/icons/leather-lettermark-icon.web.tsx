import { SVGProps, forwardRef } from 'react';

import LeatherLettermark from '../assets/icons/leather-lettermark-24-24.svg';
import { Icon } from './icon/icon.web';

export const LeatherLettermarkIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  (props, ref) => {
    return (
      <Icon ref={ref} {...props}>
        <LeatherLettermark />
      </Icon>
    );
  }
);
