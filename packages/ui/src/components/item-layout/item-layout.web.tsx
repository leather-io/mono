import { ReactNode, isValidElement } from 'react';

import { Box, Flex, HStack, Stack, styled } from 'leather-styles/jsx';

import { Flag } from '../../components/flag/flag.web';
import {
  pressableCaptionStyles,
  pressableChevronStyles,
} from '../../components/pressable/pressable.web';
import { CheckmarkIcon } from '../../icons/checkmark-icon.web';
import { ChevronUpIcon } from '../../icons/chevron-up-icon.web';

interface ItemLayoutProps {
  captionLeft: ReactNode;
  captionRight?: ReactNode;
  img?: ReactNode;
  isDisabled?: boolean;
  isSelected?: boolean;
  showChevron?: boolean;
  titleLeft: ReactNode;
  titleRight: ReactNode;
}
export function ItemLayout({
  captionLeft,
  captionRight,
  img,
  isSelected,
  showChevron,
  titleLeft,
  titleRight,
}: ItemLayoutProps) {
  const content = (
    <Flex alignItems="center" justifyContent="space-between" width="100%">
      <Stack
        alignItems="start"
        flexGrow={2}
        gap="2px"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
      >
        <HStack gap="space.01">
          {isValidElement(titleLeft) ? (
            titleLeft
          ) : (
            <styled.span
              textStyle="label.02"
              maxWidth={{ base: '175px', md: 'unset' }}
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {titleLeft}
            </styled.span>
          )}
          {isSelected && (
            <Box height="20px">
              <CheckmarkIcon variant="small" />
            </Box>
          )}
        </HStack>
        {isValidElement(captionLeft) ? (
          captionLeft
        ) : (
          <styled.span className={pressableCaptionStyles} textStyle="caption.01">
            {captionLeft}
          </styled.span>
        )}
      </Stack>
      <HStack gap="space.03">
        <Stack alignItems="end" gap="2px" height="42px">
          {isValidElement(titleRight) ? (
            titleRight
          ) : (
            <styled.span textStyle="label.02">{titleRight}</styled.span>
          )}
          {isValidElement(captionRight) ? (
            captionRight
          ) : (
            <styled.span className={pressableCaptionStyles} textStyle="caption.01">
              {captionRight}
            </styled.span>
          )}
        </Stack>
        {showChevron && (
          <ChevronUpIcon color={pressableChevronStyles} transform="rotate(90deg)" variant="small" />
        )}
      </HStack>
    </Flex>
  );

  if (img) return <Flag img={img}>{content}</Flag>;

  return content;
}
