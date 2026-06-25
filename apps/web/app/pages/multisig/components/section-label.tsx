import type { ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

interface SectionLabelProps {
  children: string;
  accessory?: ReactNode;
  noGutter?: boolean;
}

export function SectionLabel({ children, accessory, noGutter }: SectionLabelProps) {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      gap="space.03"
      mb="space.03"
      mt={noGutter ? undefined : 'space.05'}
    >
      <styled.h3 textStyle="label.01" color="ink.text-primary">
        {children}
      </styled.h3>
      {accessory}
    </Flex>
  );
}
