import { Flex, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

interface AssetSelectorErrorProps {
  error: Error;
  onRetry(): void;
}

export function AssetSelectorError({ onRetry }: AssetSelectorErrorProps) {
  return (
    <Flex
      direction="column"
      flex={1}
      px="space.07"
      justifyContent="center"
      alignItems="center"
      gap="space.04"
    >
      <Flex direction="column" gap="space.02" alignItems="center" px="space.05">
        <styled.span textStyle="label.01">Unable to load assets</styled.span>
        <styled.span textStyle="body.02" color="ink.text-subdued" textAlign="center">
          This is usually a temporary network or provider-side issue.
        </styled.span>
      </Flex>
      <Button size="sm" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </Flex>
  );
}
