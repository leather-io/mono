import { css } from 'leather-styles/css';
import { Box, Flex, FlexProps } from 'leather-styles/jsx';
import { SpacingToken } from 'leather-styles/tokens';

import type { FlagAlignment } from './flag.shared';

const flagStyles = css({
  '&[data-align="top"]': {
    alignItems: 'start',
  },
  '&[data-align="middle"]': {
    alignItems: 'center',
  },
  '&[data-align="bottom"]': {
    alignItems: 'end',
  },
});

export interface FlagProps extends FlexProps {
  align?: FlagAlignment;
  img?: React.ReactNode;
  reverse?: boolean;
  spacing?: SpacingToken;
}

/**
 * Implementation of flag object
 * https://csswizardry.com/2013/05/the-flag-object/
 * Allows only two children:
 *   1st. Image content
 *   2nd. Body content
 */
export function Flag({
  spacing = 'space.03',
  align = 'middle',
  reverse = false,
  img,
  children,
  ...props
}: FlagProps) {
  return (
    <Flex
      flexDirection={reverse ? 'row-reverse' : 'row'}
      width="100%"
      data-align={align}
      className={flagStyles}
      {...props}
    >
      <Box ml={reverse ? spacing : ''} mr={!reverse ? spacing : ''}>
        {img}
      </Box>
      <Box flex={1}>{children}</Box>
    </Flex>
  );
}
