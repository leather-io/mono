import { ReactNode } from 'react';

import { Box, HasChildren } from '@leather.io/ui/native';

export function Root({ children }: HasChildren) {
  return (
    <Box mt="-3" px="5">
      {children}
    </Box>
  );
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
      flexDirection="row"
      justifyContent="space-between"
      p="4"
      bg="ink.background-primary"
      borderColor="ink.border-transparent"
      borderWidth={1}
      borderStyle="solid"
      borderRadius="sm"
      gap="2"
      style={[typeStyle]}
    >
      {children}
    </Box>
  );
}
