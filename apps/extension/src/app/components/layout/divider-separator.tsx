import { type ReactNode, cloneElement, isValidElement } from 'react';

import { Hr, type HrProps } from '@leather.io/ui';

interface DividerSeparatorProps extends HrProps {
  children: ReactNode;
}
function isReactNodeArray(value: ReactNode): value is ReactNode[] {
  return Array.isArray(value);
}

export function DividerSeparator({ children, ...props }: DividerSeparatorProps) {
  const parsedChildren = isReactNodeArray(children) ? children : [children];

  return (
    <>
      {parsedChildren
        .flatMap((child, index) => {
          if (!isValidElement(child)) return null;
          return [
            cloneElement(child, {
              key: index,
            }),
            <Hr key={index.toString() + '-hr'} {...props} />,
          ];
        })
        .filter((_value, index, array) => index !== array.length - 1)}
    </>
  );
}
