import { ReactNode, isValidElement } from 'react';

import { ResponsiveValue } from '@shopify/restyle';
import { Theme } from 'native';

import { isString } from '@leather.io/utils';

import { Box } from '../box/box.native';
import { Text } from '../text/text.native';

export interface ItemLayoutProps {
  actionIcon?: ReactNode;
  captionLeft?: ReactNode;
  captionRight?: ReactNode;
  titleLeft: ReactNode;
  titleRight?: ReactNode;
  gap?: ResponsiveValue<keyof Theme['spacing'], Theme['breakpoints']>;
}
export function ItemLayout({
  actionIcon,
  captionLeft,
  captionRight,
  titleLeft,
  titleRight,
  gap = '2',
}: ItemLayoutProps) {
  const hasRightElement = titleRight || captionRight;

  return (
    <Box flex={1} alignItems="center" flexDirection="row" justifyContent="space-between" gap={gap}>
      <Box alignItems="flex-start" flex={1} mr="3" overflow="hidden" gap={gap}>
        {isValidElement(titleLeft) ? titleLeft : <Text variant="label02">{titleLeft}</Text>}
        {captionLeft && isValidElement(captionLeft) && captionLeft}
        {captionLeft && isString(captionLeft) && (
          <Text variant="caption01" color="ink.text-subdued">
            {captionLeft}
          </Text>
        )}
      </Box>
      {hasRightElement && (
        <Box flex={1} alignItems="flex-end" gap={gap}>
          {isValidElement(titleRight) ? titleRight : <Text variant="label02">{titleRight}</Text>}
          {captionRight && isValidElement(captionRight) && captionRight}
          {captionRight && isString(captionRight) && (
            <Text variant="caption01" color="ink.text-subdued">
              {captionRight}
            </Text>
          )}
        </Box>
      )}
      {actionIcon}
    </Box>
  );
}
