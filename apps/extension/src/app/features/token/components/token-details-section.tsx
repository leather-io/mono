import type { ReactNode } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

interface TokenDetailsSectionProps {
  title: string;
  children: ReactNode;
  isTitleCentered?: boolean;
}

export function TokenDetailsSection({
  title,
  children,
  isTitleCentered = false,
}: TokenDetailsSectionProps) {
  return (
    <Stack bg="ink.background-primary" py="space.03" width="100%">
      <Flex
        px="space.05"
        py="space.02"
        height="40px"
        alignItems="center"
        justifyContent={isTitleCentered ? 'center' : 'flex-start'}
      >
        <styled.span textStyle="label.02">{title}</styled.span>
      </Flex>
      {children}
    </Stack>
  );
}
