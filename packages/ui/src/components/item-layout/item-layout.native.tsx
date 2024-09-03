import { ReactNode, isValidElement } from 'react';

import { isString } from '@leather.io/utils';

import { Box } from '../box/box.native';
import { HStack } from '../box/hstack.native';
import { Stack } from '../box/stack.native';
import { Text } from '../text/text.native';

export interface ItemLayoutProps {
  actionIcon?: ReactNode;
  captionLeft?: ReactNode;
  captionRight?: ReactNode;
  titleLeft: ReactNode;
  titleRight?: ReactNode;
}
export function ItemLayout({
  actionIcon,
  captionLeft,
  captionRight,
  titleLeft,
  titleRight,
}: ItemLayoutProps) {
  return (
    <Box flex={1} alignItems="center" flexDirection="row" justifyContent="space-between">
      <Stack alignItems="flex-start" flexGrow={1} overflow="hidden">
        {isValidElement(titleLeft) ? titleLeft : <Text variant="label02">{titleLeft}</Text>}
        {captionLeft && isValidElement(captionLeft) && captionLeft}
        {captionLeft && isString(captionLeft) && (
          <Text variant="caption01" color="ink.text-subdued">
            {captionLeft}
          </Text>
        )}
      </Stack>
      <HStack flex={1} gap="3">
        <Stack alignItems="flex-end">
          {isValidElement(titleRight) ? titleRight : <Text variant="label02">{titleRight}</Text>}
          {captionRight && isValidElement(captionRight) && captionRight}
          {captionRight && isString(captionRight) && (
            <Text variant="caption01" color="ink.text-subdued">
              {captionRight}
            </Text>
          )}
        </Stack>
        {actionIcon}
      </HStack>
    </Box>
  );
}
