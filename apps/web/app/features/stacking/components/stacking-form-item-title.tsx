import { HStack, styled } from 'leather-styles/jsx';

import { InfoCircleIcon } from '@leather.io/ui';
import { StackingAmountLabel, StackingRewardsAddressLabel, StackingDurationLabel, StackingContractDetailsLabel, PooledStackingConditionsLabel } from '~/components/pool-overview';
import { content } from '~/data/content';

interface StackingFormItemTitleProps {
  title: string;
  labelTagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'span';
}

export function StackingFormItemTitle(props: StackingFormItemTitleProps) {
  const { title, labelTagName = 'h1' } = props;
  const Tag = styled[labelTagName];
  if (title === (content.posts['stacking-amount']?.title ?? 'Amount')) {
    return <StackingAmountLabel tagName={labelTagName} textStyle="label.01" />;
  } else if (title === (content.posts['stacking-rewards-address']?.title ?? 'Address to receive rewards')) {
    return <StackingRewardsAddressLabel tagName={labelTagName} textStyle="label.01" />;
  } else if (title === (content.posts['stacking-duration']?.title ?? 'Duration')) {
    return <StackingDurationLabel tagName={labelTagName} textStyle="label.01" />;
  } else if (title === (content.posts['stacking-contract-details']?.title ?? 'Details')) {
    return <StackingContractDetailsLabel tagName={labelTagName} textStyle="label.01" />;
  } else if (title === (content.posts['pooled-stacking-conditions']?.title ?? 'Pooling conditions')) {
    return <PooledStackingConditionsLabel tagName={labelTagName} textStyle="label.01" />;
  } else {
    return <Tag textStyle="label.01">{title}</Tag>;
  }
}
