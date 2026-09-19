import type { ReactNode } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';

interface DetailsRowProps {
  label: string;
  value: ReactNode;
  testId?: string;
}

export function DetailsRow({ label, value, testId }: DetailsRowProps) {
  return (
    <Flex
      px="space.05"
      py="space.01"
      minHeight="30px"
      gap="space.04"
      alignItems="center"
      justifyContent="space-between"
      data-testid={testId}
    >
      <styled.span textStyle="label.03" color="ink.text-subdued" flexShrink={0}>
        {label}
      </styled.span>
      <Box textStyle="caption.01" textAlign="right" minWidth={0}>
        {value}
      </Box>
    </Flex>
  );
}
