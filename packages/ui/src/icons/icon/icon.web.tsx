import React from 'react';

import { token } from 'leather-styles/tokens';

import { IconVariant } from './icon.shared';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  variant?: IconVariant;
}
export function Icon({ children, ...props }: IconProps) {
  const child = React.Children.only(children) as React.ReactElement;

  return (
    <>
      {React.cloneElement(child, {
        color: token('colors.ink.action-primary-default'),
        ...props,
      })}
    </>
  );
}
