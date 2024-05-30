import { memo } from 'react';

import { styled } from 'leather-styles/jsx';

import { SkeletonLoader, shimmerStyles } from '../skeleton-loader';

interface AccountTotalBalanceProps {
  totalUsdBalance: string;
  isFetching: boolean;
  isInitialLoading: boolean;
}

export const AccountTotalBalance = memo(
  ({ totalUsdBalance, isFetching, isInitialLoading }: AccountTotalBalanceProps) => {
    if (!totalUsdBalance) return null;

    return (
      <SkeletonLoader height="20px" isLoading={isInitialLoading}>
        <styled.span
          className={shimmerStyles}
          textStyle="label.02"
          data-state={isFetching ? 'loading' : undefined}
        >
          {totalUsdBalance}
        </styled.span>
      </SkeletonLoader>
    );
  }
);
