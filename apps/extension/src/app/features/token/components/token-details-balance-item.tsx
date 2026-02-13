import { type ReactNode, useMemo } from 'react';

import { Flex, Stack, styled } from 'leather-styles/jsx';

import { truncateMiddle } from '@leather.io/utils';

interface TokenDetailsBalanceItemProps {
  title: string;
  address?: string;
  rightTop: ReactNode;
  rightBottom?: ReactNode;
  onPressAddress?(): void;
  onPressRow?(): void;
}

export function TokenDetailsBalanceItem({
  title,
  address,
  rightTop,
  rightBottom,
  onPressAddress,
  onPressRow,
}: TokenDetailsBalanceItemProps) {
  const addressElement = useMemo(() => {
    if (!address) return null;
    if (onPressAddress) {
      return (
        <styled.button
          type="button"
          textStyle="caption.02"
          color="ink.text-subdued"
          textDecoration="underline"
          textAlign="left"
          _hover={{ cursor: 'pointer' }}
          onClick={e => {
            e.stopPropagation();
            onPressAddress();
          }}
        >
          {truncateMiddle(address, 6)}
        </styled.button>
      );
    }
    return (
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        {truncateMiddle(address, 6)}
      </styled.span>
    );
  }, [address, onPressAddress]);

  const content = (
    <>
      <Stack gap="2px" minWidth="0">
        <styled.span textStyle="label.02">{title}</styled.span>
        {addressElement}
      </Stack>
      <Stack gap="2px" alignItems="flex-end">
        <styled.span textStyle="label.02">{rightTop}</styled.span>
        {rightBottom ? (
          <styled.span textStyle="caption.01" color="ink.text-primary">
            {rightBottom}
          </styled.span>
        ) : null}
      </Stack>
    </>
  );

  if (onPressRow) {
    return (
      <styled.button
        type="button"
        display="flex"
        px="space.05"
        py="space.03"
        alignItems="center"
        justifyContent="space-between"
        gap="space.03"
        width="100%"
        bg="transparent"
        _hover={{ bg: 'ink.component-background-hover', cursor: 'pointer' }}
        onClick={onPressRow}
      >
        {content}
      </styled.button>
    );
  }

  return (
    <Flex
      px="space.05"
      py="space.03"
      alignItems="center"
      justifyContent="space-between"
      gap="space.03"
    >
      {content}
    </Flex>
  );
}
