import { ReactNode } from 'react';

import { Flex, HStack, Stack, styled } from 'leather-styles/jsx';

import { pressableCaptionStyles } from '../../components/pressable/pressable.web';
import { Flag } from '../flag/flag.web';

interface ItemWithButtonsLayoutProps {
  buttons: ReactNode;
  caption: string;
  flagImg: ReactNode;
  title: string;
}
export function ItemLayoutWithButtons({
  buttons,
  caption,
  flagImg,
  title,
}: ItemWithButtonsLayoutProps) {
  return (
    <Flag img={flagImg}>
      <Flex alignItems="center" justifyContent="space-between" width="100%">
        <Stack
          alignItems="start"
          flexGrow={2}
          gap="2px"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          <styled.span textStyle="label.02">{title}</styled.span>
          <styled.span className={pressableCaptionStyles} textStyle="caption.01">
            {caption}
          </styled.span>
        </Stack>
        <HStack alignItems="end" gap="space.00">
          {buttons}
        </HStack>
      </Flex>
    </Flag>
  );
}
