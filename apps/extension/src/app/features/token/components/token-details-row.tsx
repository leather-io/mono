import type { ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

interface TokenDetailsRowProps {
  label: string;
  value: ReactNode;
  valueAction?(): void;
  testId?: string;
}

export function TokenDetailsRow({ label, value, valueAction, testId }: TokenDetailsRowProps) {
  return (
    <Flex
      px="space.05"
      py="space.01"
      height="30px"
      alignItems="center"
      justifyContent="space-between"
      data-testid={testId}
    >
      <styled.span textStyle="label.03" color="ink.text-subdued-primary">
        {label}
      </styled.span>
      {valueAction ? (
        <styled.button
          type="button"
          textStyle="caption.01"
          textDecoration="underline"
          _hover={{ cursor: 'pointer' }}
          onClick={valueAction}
        >
          {value}
        </styled.button>
      ) : (
        <styled.span textStyle="caption.01">{value}</styled.span>
      )}
    </Flex>
  );
}
