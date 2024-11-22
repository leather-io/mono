import { Component, forwardRef } from 'react';

import { IconVariantMap } from 'src/icons/types.shared';

import ArrowUpSmall from '../assets/icons/arrow-up-16-16.svg';
import ArrowUp from '../assets/icons/arrow-up-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

const variants: IconVariantMap = {
  small: <ArrowUpSmall />,
  default: <ArrowUp />,
};

export const ArrowUpIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      {variants[variant ?? 'default']}
    </Icon>
  );
});
