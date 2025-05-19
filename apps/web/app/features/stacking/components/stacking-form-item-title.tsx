import { HStack, styled } from 'leather-styles/jsx';
import React from 'react';

import { InfoCircleIcon } from '@leather.io/ui';
import { StackingAmountLabel, StackingRewardsAddressLabel, StackingDurationLabel, StackingContractDetailsLabel, PooledStackingConditionsLabel } from '~/components/pool-overview';

interface StackingFormItemTitleProps {
  title: string;
  labelTagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'span';
}

export function StackingFormItemTitle(props: StackingFormItemTitleProps) {
  const { title, labelTagName = 'h1' } = props;
  const Tag = styled[labelTagName];
  return (
    <HStack gap="space.02">
      {title === 'Amount' ? (
        <StackingAmountLabel tagName={labelTagName} textStyle="label.01" />
      ) : title === 'Address to receive rewards' ? (
        <StackingRewardsAddressLabel tagName={labelTagName} textStyle="label.01" />
      ) : title === 'Duration' ? (
        <StackingDurationLabel tagName={labelTagName} textStyle="label.01" />
      ) : title === 'Details' ? (
        <StackingContractDetailsLabel tagName={labelTagName} textStyle="label.01" />
      ) : title === 'Pooling conditions' ? (
        <PooledStackingConditionsLabel tagName={labelTagName} textStyle="label.01" />
      ) : (
        <Tag textStyle="label.01">{title}</Tag>
      )}
    </HStack>
  );
}
