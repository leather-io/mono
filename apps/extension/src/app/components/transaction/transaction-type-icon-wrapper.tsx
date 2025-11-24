import type { ReactNode } from 'react';

import { Circle, CircleProps } from 'leather-styles/jsx';

interface TransactionTypeIconWrapperProps extends CircleProps {
  bg?: any;
  icon: ReactNode;
}
export function TransactionTypeIconWrapper({
  bg = 'stacks',
  icon,
  ...props
}: TransactionTypeIconWrapperProps) {
  return (
    <Circle
      bg={bg}
      border="background"
      bottom="-2px"
      color="ink.background-primary"
      position="absolute"
      right="-9px"
      size="21px"
      {...props}
    >
      {icon}
    </Circle>
  );
}
