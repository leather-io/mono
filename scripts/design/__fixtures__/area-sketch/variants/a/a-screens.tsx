import { Flex, Stack, styled } from 'leather-styles/jsx';

import { PrivateBadge } from '../../shared/private-label';

// A row defined inside the screens file: a real component, still assessed.
function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex justifyContent="space-between" style={{ gap: '13px' }}>
      <styled.span textStyle="label.02">{label}</styled.span>
      <styled.span textStyle="label.02">{value}</styled.span>
    </Flex>
  );
}

// The screen itself: a composition, skipped.
export function AReview() {
  return (
    <Stack gap="space.04" p="space.05">
      <PrivateBadge />
      <AmountRow label="Total" value="0.005 sBTC" />
    </Stack>
  );
}
