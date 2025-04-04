import { ReactNode } from 'react';

import { Flex, FlexProps, styled } from 'leather-styles/jsx';

interface ValueDisplayerProps extends FlexProps {
  name: ReactNode;
  value: ReactNode;
}
export function ValueDisplayer({ name, value }: ValueDisplayerProps) {
  return (
    <Flex flex={1} flexDir="column" justifyContent="space-between" p="space.05">
      <styled.h4 color="ink.text-subdued" textStyle="label.03">
        {name}
      </styled.h4>
      <styled.span textStyle="label.01">{value}</styled.span>
    </Flex>
  );
}
