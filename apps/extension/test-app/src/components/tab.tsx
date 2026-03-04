import React from 'react';

import { Box } from 'leather-styles/jsx';

interface Props {
  children: React.ReactNode;
}

export function InactiveTab({ children }: Props) {
  return (
    <Box
      color="ink.text-subdued-secondary"
      mr={6}
      py={3}
      borderColor="white"
      borderBottomWidth="2px"
      cursor="pointer"
    >
      {children}
    </Box>
  );
}

export function ActiveTab({ children }: Props) {
  return (
    <Box
      color="ink.text-primary"
      mr={6}
      py={3}
      borderColor="blue"
      borderBottomWidth="2px"
      cursor="pointer"
    >
      {children}
    </Box>
  );
}

interface TabProps extends Props {
  active: boolean;
}

export function Tab({ active, ...rest }: TabProps) {
  if (active) {
    return <ActiveTab {...rest} />;
  }
  return <InactiveTab {...rest} />;
}
