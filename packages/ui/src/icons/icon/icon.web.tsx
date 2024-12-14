import React, { Children, ReactElement, forwardRef } from 'react';

import { token } from 'leather-styles/tokens';

import { IconVariant } from './icon.shared';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  variant?: IconVariant;
}
export const Icon = forwardRef<SVGSVGElement, IconProps>(({ children, ...props }, ref) => {
  const child = Children.only(children) as ReactElement;

  return (
    <>
      {React.cloneElement(child, {
        color: token('colors.ink.action-primary-default'),
        ref,
        ...props,
      })}
    </>
  );
});

Icon.displayName = 'Icon';
