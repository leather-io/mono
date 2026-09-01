import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

import { SkeletonLoader } from '@leather.io/ui';

import { PrivateText } from '@app/components/privacy/private-text';

interface BalanceAmountProps extends HTMLStyledProps<'span'> {
  value: string;
  isLoading?: boolean;
  canClickToShow?: boolean;
  skeletonWidth: string;
  skeletonHeight: string;
}

export function BalanceAmount({
  value,
  isLoading,
  canClickToShow,
  skeletonWidth,
  skeletonHeight,
  ...props
}: BalanceAmountProps) {
  return (
    <SkeletonLoader isLoading={!!isLoading} width={skeletonWidth} height={skeletonHeight}>
      <styled.span {...props}>
        <PrivateText canClickToShow={canClickToShow}>{value}</PrivateText>
      </styled.span>
    </SkeletonLoader>
  );
}
