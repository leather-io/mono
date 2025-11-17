import { Box, styled } from 'leather-styles/jsx';

import { Callout } from '@leather.io/ui';

export function SupportFormError() {
  return (
    <Box width="100%" maxW="600px">
      <Callout variant="error" title="Submission Failure">
        <styled.p>
          There was an issue with your form submission. Please try again or email us directly at{' '}
          <styled.a
            href="mailto:support@leather.io"
            color="ink.action-primary-hover"
            textDecoration="underline"
          >
            support@leather.io
          </styled.a>
          .
        </styled.p>
      </Callout>
    </Box>
  );
}
