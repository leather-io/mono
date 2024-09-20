import { ReactNode, cloneElement, isValidElement } from 'react';

import { ensureArray } from '@leather.io/utils';

interface BulletSeparatorSeparatorProps {
  children: ReactNode;
  operator: ReactNode;
}
export function BulletSeparator({ children, operator }: BulletSeparatorSeparatorProps) {
  const parsedChildren = ensureArray(children);
  const content = parsedChildren
    .flatMap((child: ReactNode, index: number) => {
      if (!isValidElement(child) || !isValidElement(operator)) return null;
      return [
        cloneElement(child, { key: 'element-' + index }),
        cloneElement(operator, { key: 'operator-' + index }),
      ];
    })
    .filter(val => val !== null)
    .slice(0, -1);

  return content;
}
