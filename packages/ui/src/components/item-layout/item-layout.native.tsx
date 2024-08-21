import { ReactNode, isValidElement } from 'react';

import { Flag } from '../../components/flag/flag.native';
import { Text } from '../../components/text/text.native';
import { ChevronUpIcon } from '../../icons/chevron-up-icon.native';
import { Box } from '../box/box.native';
import { HStack } from '../box/hstack.native';
import { Stack } from '../box/stack.native';

export interface ItemLayoutProps {
  captionLeft: ReactNode;
  captionRight?: ReactNode;
  flagImg: ReactNode;
  isDisabled?: boolean;
  isSelected?: boolean;
  showChevron?: boolean;
  titleLeft: ReactNode;
  titleRight: ReactNode;
}

export function ItemLayout({
  captionLeft,
  captionRight,
  flagImg,
  showChevron,
  titleLeft,
  titleRight,
}: ItemLayoutProps) {
  return (
    <Flag img={flagImg} spacing="3">
      <Box flex={1} alignItems="center" justifyContent="space-between">
        <Stack
          alignItems="flex-start"
          justifyContent="space-between"
          flexGrow={2}
          overflow="hidden"
        >
          <HStack>{isValidElement(titleLeft) ? titleLeft : <Text>{titleLeft}</Text>}</HStack>
          {isValidElement(captionLeft) ? (
            captionLeft
          ) : (
            <Text variant="caption01" color="ink.text-subdued">
              {captionLeft}
            </Text>
          )}
        </Stack>

        <HStack gap="3">
          <Stack alignItems="flex-end" gap="2" height={42}>
            {isValidElement(titleRight) ? titleRight : <Text variant="label02">{titleRight}</Text>}
            {isValidElement(captionRight) ? (
              captionRight
            ) : (
              <Text variant="caption01" color="ink.text-subdued">
                {captionRight}
              </Text>
            )}
          </Stack>
          {showChevron && (
            <ChevronUpIcon
              color="ink.action-primary-default"
              transform="rotate(90deg)"
              variant="small"
            />
          )}
        </HStack>
      </Box>
    </Flag>
  );
}
