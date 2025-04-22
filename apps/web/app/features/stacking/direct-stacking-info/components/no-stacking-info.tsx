import { Link } from 'react-router';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

export function NoStackingInfo() {
  return (
    <Flex height="100%" justify="center" align="center" m="loose">
      <Box>
        <Stack>
          <styled.p>
            It appears that you&apos;re not stacking yet. If you recently started to stack, your
            stacking info will appear here in a few seconds.
          </styled.p>
          <styled.p>
            You may want to{' '}
            <Link to="../start-direct-stacking" color="ink.text-primary">
              start stacking
            </Link>{' '}
            or{' '}
            <Link to="../choose-stacking-method" color="ink.text-primary">
              choose your stacking method
            </Link>
            .
          </styled.p>
        </Stack>
      </Box>
    </Flex>
  );
}
