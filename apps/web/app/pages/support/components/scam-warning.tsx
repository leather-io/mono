import { Box, styled } from 'leather-styles/jsx';

import { InfoCircleIcon } from '@leather.io/ui';

export function ScamWarning() {
  return (
    <Box mb="space.07" bg="ink.background-secondary" p="space.04" borderRadius="md">
      <Box display="flex" justifyContent="space-between" mb="space.06" pr="space.03">
        <styled.h4 textStyle="label.02">Stay safe from scams</styled.h4>
        <InfoCircleIcon color="ink.action-primary-default" variant="small" />
      </Box>
      <styled.p textStyle="caption.01" color="ink.action-primary-hover">
        Leather will never contact you first via direct messages on any platform. If someone reaches
        out claiming to be from Leather and offering help, they're a scammer.
        <br />
        <br />
        Never share your Secret Key or personal information—not even with Leather staff. We will
        never ask for it to resolve any issue. Keep it private and secure at all times.
      </styled.p>
      <styled.p textStyle="label.03" color="ink.action-primary-hover" mt="space.06">
        Contact us via{' '}
        <styled.a
          href="mailto:support@leather.io"
          color="ink.action-primary-hover"
          textDecoration="underline"
        >
          support@leather.io
        </styled.a>{' '}
        or use the contact form.
      </styled.p>
    </Box>
  );
}
