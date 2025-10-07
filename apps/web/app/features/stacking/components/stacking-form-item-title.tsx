import { styled } from 'leather-styles/jsx';
import { LearnHoverCard } from '~/components/learn-hover-card';
import type { LearnArticle } from '~/content/learn-content';

interface StackingFormItemTitleProps {
  title: string;
  article?: LearnArticle;
  labelTagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'span';
}

export function StackingFormItemTitle(props: StackingFormItemTitleProps) {
  const { title, article, labelTagName = 'h1' } = props;
  const Tag = styled[labelTagName];

  if (article) {
    const label = article.title ?? title;
    return (
      <LearnHoverCard article={article} label={label} textStyle="label.01" tagName={labelTagName} />
    );
  }

  return <Tag textStyle="label.01">{title}</Tag>;
}
