import { Box, styled } from 'leather-styles/jsx';

import { Callout } from '@leather.io/ui';

export function SupportFormSuccess() {
  return (
    <Box width="100%" maxW="600px">
      <Callout variant="success" title="Message sent successfully!">
        <styled.p>
          Thank you for contacting Leather support. We've received your message and will get back to
          you as soon as possible.
        </styled.p>
      </Callout>
    </Box>
  );
}
