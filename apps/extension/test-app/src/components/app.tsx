import React from 'react';

import { Home } from '@components/home';
import { Flex } from 'leather-styles/jsx';

export function App() {
  return (
    <Flex width="100%" flexDirection="column" minHeight="100vh" bg="white">
      <Home />
    </Flex>
  );
}
