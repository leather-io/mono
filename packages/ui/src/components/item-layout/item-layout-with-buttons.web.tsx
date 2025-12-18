import { ReactNode } from 'react';

import { Flex, HStack, Stack, styled } from 'leather-styles/jsx';
import { SpacingToken } from 'leather-styles/tokens';

import { pressableCaptionStyles } from '../../components/pressable/pressable.web';
import { Flag } from '../flag/flag.web';

interface ItemWithButtonsLayoutProps {
  buttons: ReactNode;
  caption?: string;
  gap?: SpacingToken;
  img?: ReactNode;
  title: ReactNode;
}
export function ItemLayoutWithButtons({
  buttons,
  caption,
  gap = 'space.02',
  img,
  title,
}: ItemWithButtonsLayoutProps) {
  const content = (
    <Flex alignItems="center" justifyContent="space-between">
      <Stack alignItems="start" flexGrow={2} gap={gap} overflow="hidden" textOverflow="ellipsis">
        <styled.span textStyle="label.02">{title}</styled.span>
        {caption && (
          <styled.span className={pressableCaptionStyles} textStyle="caption.01">
            {caption}
          </styled.span>
        )}
      </Stack>
      <HStack alignItems="end" gap="space.00">
        {buttons}
      </HStack>
    </Flex>
  );
  if (img) {
    return (
      <Flag img={img} alignItems="center" width="100%">
        {content}
      </Flag>
    );
  }
  return content;
}
