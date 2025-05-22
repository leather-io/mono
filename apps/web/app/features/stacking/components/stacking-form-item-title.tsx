import { HStack, styled } from 'leather-styles/jsx';

import { InfoCircleIcon } from '@leather.io/ui';
import { StackingAmountLabel, StackingRewardsAddressLabel, StackingDurationLabel, StackingContractDetailsLabel, PooledStackingConditionsLabel } from '~/components/pool-overview';
import { content } from '~/data/content';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';

interface StackingFormItemTitleProps {
  title: string;
  postKey?: string;
  labelTagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'span';
}

export function StackingFormItemTitle(props: StackingFormItemTitleProps) {
  const { title, postKey, labelTagName = 'h1' } = props;
  const Tag = styled[labelTagName];
  const posts = content.posts as unknown as import('~/data/post-types').PostsCollection;
  if (postKey && posts[postKey]) {
    const label = posts[postKey]?.title ?? title;
    return (
      <PostLabelHoverCard
        postKey={postKey}
        label={label}
        textStyle="label.01"
        tagName={labelTagName}
      />
    );
  }
  return <Tag textStyle="label.01">{title}</Tag>;
}
