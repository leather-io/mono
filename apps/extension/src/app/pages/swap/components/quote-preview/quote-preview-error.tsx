import { Divider, styled } from 'leather-styles/jsx';

interface QuotePreviewErrorProps {
  error: Error;
  onRetry(): void;
}

export function QuotePreviewError({ onRetry }: QuotePreviewErrorProps) {
  return (
    <styled.div
      display="flex"
      flexDirection="column"
      bg="red.background-primary"
      borderRadius="sm"
      p="space.04"
      gap="space.02"
    >
      <styled.span textStyle="label.03">Unable to load the quote</styled.span>
      <styled.span textStyle="caption.01">
        This is usually a temporary network or provider-side issue.
      </styled.span>
      <Divider my="space.01" />
      <styled.button onClick={onRetry} alignSelf="center" cursor="pointer">
        <styled.span textStyle="label.03">Retry</styled.span>
      </styled.button>
    </styled.div>
  );
}
