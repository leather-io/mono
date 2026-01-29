import { ReactNode } from 'react';

import { Flex } from 'leather-styles/jsx';

interface TabContentHeaderProps {
  leftElement: ReactNode;
  rightElement?: ReactNode;
}

export function TabContentHeader({ leftElement, rightElement }: TabContentHeaderProps) {
  return (
    <Flex justifyContent="space-between" alignItems="flex-start">
      {leftElement}
      {rightElement}
    </Flex>
  );
}
