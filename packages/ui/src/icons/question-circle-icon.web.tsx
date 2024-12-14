import { forwardRef } from 'react';

import QuestionCircleSmall from '../assets/icons/question-circle-16-16.svg';
import QuestionCircle from '../assets/icons/question-circle-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const QuestionCircleIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <QuestionCircleSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <QuestionCircle />
      </Icon>
    );
  }
);

QuestionCircleIcon.displayName = 'QuestionCircleIcon';
