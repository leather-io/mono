import { useState } from 'react';

export function useRegisterChildren<T extends string>() {
  const [childCount, setChildCount] = useState<Partial<Record<T, number>>>({});

  function registerChild(child: T) {
    setChildCount(children => ({ ...children, [child]: (children[child] || 0) + 1 }));
  }

  function deregisterChild(child: T) {
    setChildCount(children => ({ ...children, [child]: (children[child] || 0) - 1 }));
  }

  function hasChild(child: T) {
    return (childCount[child] ?? 0) > 0;
  }

  const children: T[] = [];
  for (const child in childCount) children.push(child);

  return {
    childCount,
    children,
    registerChild,
    deregisterChild,
    hasChild,
  };
}

export type ChildRegister<T extends string> = ReturnType<typeof useRegisterChildren<T>>;
