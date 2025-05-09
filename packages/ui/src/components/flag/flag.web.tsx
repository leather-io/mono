import { css } from 'leather-styles/css';
import { Box, Flex, FlexProps } from 'leather-styles/jsx';
import { SpacingToken, Token, token } from 'leather-styles/tokens';

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
      width="fit-content"
      data-align={align}
      className={flagStyles}
      {...props}
    >
      <div
        // Ugly code, however this deals with the nature of Panda being unable
        // to infer the token to use from its static analysis, given that
        // `spacing` maps to either `mr` or `ml` depending on the `reverse` prop
        className={css({
          mr: reverse ? undefined : 'var(--flag-spacing)',
          ml: reverse ? 'var(--flag-spacing)' : undefined,
        })}
        style={
          { '--flag-spacing': token.var(('spacing.' + spacing) as Token) } as React.CSSProperties
        }
      >
        {img}
      </div>
      <Box flex={1}>{children}</Box>
    </Flex>
  );
}
