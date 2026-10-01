import type { ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

import { Badge } from '@leather.io/ui';

interface ApproxAmountProps {
  children: ReactNode;
}

export function ApproxAmount({ children }: ApproxAmountProps) {
  return (
    <>
      <styled.span pr="2px">≈</styled.span>
      {children}
    </>
  );
}

interface ApprovalEstimateSourceProps {
  source: string;
}

export function ApprovalEstimateSource({ source }: ApprovalEstimateSourceProps) {
  return (
    <Flex
      as="span"
      alignItems="center"
      gap="space.02"
      flexWrap="wrap"
      pt="2px"
      data-approval-zone="estimate"
    >
      <Badge label="Estimate" variant="info" outlined flexShrink={0} />
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        from {source}
      </styled.span>
    </Flex>
  );
}
