import { Component, forwardRef } from 'react';

import { IconVariantMap } from 'src/icons/types.shared';

import ArrowDownSmall from '../assets/icons/arrow-down-16-16.svg';
import ArrowDown from '../assets/icons/arrow-down-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

const variants: IconVariantMap = {
  small: <ArrowDownSmall />,
  default: <ArrowDown />,
};

export const ArrowDownIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      {variants[variant ?? 'default']}
    </Icon>
  );
});
