import UfoImg from '@assets/illustrations/ufo.png';
import { Flex, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

interface SwapReviewEmptyStateProps {
  onBack(): void;
}

export function SwapReviewEmptyState({ onBack }: SwapReviewEmptyStateProps) {
  return (
    <Flex
      direction="column"
      flex={1}
      px="space.07"
      pb="space.05"
      justifyContent="center"
      alignItems="center"
      gap="space.04"
    >
      <styled.img src={UfoImg} width="180px" height="180px" alt="" />
      <Flex direction="column" gap="space.02" alignItems="center" px="space.05">
        <styled.span textStyle="label.01">No quotes available</styled.span>
        <styled.span textStyle="body.02" color="ink.text-subdued" textAlign="center">
          Not enough liquidity or no route available right now. Try a smaller amount or check back
          later.
        </styled.span>
      </Flex>
      <Button size="sm" variant="outline" onClick={onBack}>
        Go back
      </Button>
    </Flex>
  );
}
