import { ReactNode } from 'react';

import { Box } from '@leather.io/ui/native';

interface RootProps {
  children: ReactNode;
}

export function Root({ children }: RootProps) {
  return <Box px="5">{children}</Box>;
}

interface CardProps {
  type: 'pay' | 'receive';
  children: ReactNode;
}

export function Card({ type, children }: CardProps) {
  const typeStyle = {
    pay: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    receive: {
      marginTop: -1,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },
  }[type];

  return (
    <Box
      p="4"
      bg="ink.background-primary"
      borderColor="ink.border-transparent"
      borderWidth={1}
      borderStyle="solid"
      borderRadius="sm"
      gap="3"
      style={[typeStyle]}
    >
      {children}
    </Box>
  );
}

interface CardRowProps {
  children: ReactNode;
}

export function CardRow({ children }: CardRowProps) {
  return (
    <Box flexDirection="row" alignItems="center" justifyContent="space-between" gap="2">
      {children}
    </Box>
  );
}
