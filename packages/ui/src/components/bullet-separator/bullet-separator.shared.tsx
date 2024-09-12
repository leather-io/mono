import { ReactNode, cloneElement, isValidElement } from 'react';

interface BulletSeparatorSeparatorProps {
  children: ReactNode;
  operator: ReactNode;
}
export function BulletSeparator({ children, operator }: BulletSeparatorSeparatorProps) {
  const parsedChildren = Array.isArray(children) ? children : [children];
  const content = parsedChildren
    .flatMap((child: ReactNode, index: number) => {
      if (!isValidElement(child)) return null;
      return [cloneElement(child, { key: index }), operator];
    })
    .filter((val: ReactNode) => val !== null)
    .slice(0, -1);
  return <>{content}</>;
}
