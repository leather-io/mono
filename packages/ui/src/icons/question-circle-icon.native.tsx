import { Component, forwardRef } from 'react';

import QuestionCircleSmall from '../assets/icons/question-circle-16-16.svg';
import QuestionCircle from '../assets/icons/question-circle-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const QuestionCircleIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
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
});
