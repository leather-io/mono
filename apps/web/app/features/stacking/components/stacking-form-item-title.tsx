import { styled } from 'leather-styles/jsx';
import { PostLabelHoverCard } from '~/components/post-label-hover-card';
import type { Post } from '~/data/post-types';

interface StackingFormItemTitleProps {
  title: string;
  post?: Post;
  labelTagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'span';
}

export function StackingFormItemTitle(props: StackingFormItemTitleProps) {
  const { title, post, labelTagName = 'h1' } = props;
  const Tag = styled[labelTagName];

  if (post) {
    const label = post.title ?? title;
    return (
      <PostLabelHoverCard post={post} label={label} textStyle="label.01" tagName={labelTagName} />
    );
  }

  return <Tag textStyle="label.01">{title}</Tag>;
}
