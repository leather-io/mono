import { styled } from 'leather-styles/jsx';

export function QuotePreviewEmptyState() {
  return (
    <styled.div
      display="flex"
      flexDirection="column"
      bg="yellow.background-primary"
      borderRadius="sm"
      p="space.04"
      gap="space.02"
    >
      <styled.span textStyle="label.03">No quotes available for this swap.</styled.span>
      <styled.span textStyle="caption.01">
        Not enough liquidity or no route available right now. Try a smaller amount or check back in
        a few minutes.
      </styled.span>
    </styled.div>
  );
}
