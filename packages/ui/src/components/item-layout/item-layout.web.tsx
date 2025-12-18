import { ReactNode, isValidElement } from 'react';

import { Box, Flex, HStack, Stack, styled } from 'leather-styles/jsx';
import { SpacingToken } from 'leather-styles/tokens';

import { CheckmarkIcon } from '../../icons/checkmark-icon.web';
import { ChevronRightIcon } from '../../icons/chevron-right-icon.web';
import { Flag } from '../flag/flag.web';
import { pressableCaptionStyles, pressableChevronStyles } from '../pressable/pressable.web';

interface ItemLayoutProps {
  captionLeft: ReactNode;
  captionRight?: ReactNode;
  gap?: SpacingToken;
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
  gap = 'space.02',
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
        gap={gap}
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
      <HStack gap={gap}>
        <Stack alignItems="end" gap={gap}>
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
          <ChevronRightIcon
            className={pressableChevronStyles}
            transform="rotate(90deg)"
            variant="small"
          />
        )}
      </HStack>
    </Flex>
  );

  if (img)
    return (
      <Flag width="100%" img={img}>
        {content}
      </Flag>
    );

  return content;
}
