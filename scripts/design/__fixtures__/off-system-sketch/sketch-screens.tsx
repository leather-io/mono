import { Stack, styled } from 'leather-styles/jsx';

import { Button, Caption, LockIcon } from '@leather.io/ui';

export function SketchReview() {
  return (
    <Stack gap="space.04" p="space.05">
      <styled.span textStyle="heading.05" color="ink.text-primary">
        Review
      </styled.span>
      {/* Restyled ui components: each needs a why (Component.prop). */}
      <Caption color="ink.text-non-interactive">bc1q…4kf2</Caption>
      <LockIcon variant="medium" />
      <Button size="md" mt="space.02">
        Transfer
      </Button>
    </Stack>
  );
}
