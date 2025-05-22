import { styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { Accordion, Link } from '@leather.io/ui';
import { content } from '~/data/content';
import { getPostHref } from '~/utils/post-link';
import { sanitizeContent } from '~/utils/sanitize-content';
import type { Post } from '~/data/post-types';

// List of stacking-related post keys to use in the FAQ, ordered by appearance on the page
const stackingFaqPostKeysRaw = [
  // Main section headings
  'stacking',
  'pooled-stacking',
  'liquid-stacking',
  // Explainer steps (traditional and liquid)
  'stacks-token-stx',
  'stacking-providers',
  'stacking-lock-stx',
  'stacking-rewards',
  'stacking-liquid-token',
  // Table posts (in order of table columns)
  'stacking-providers',
  'stacking-rewards-tokens',
  'stacking-minimum-commitment',
  'historical-yield',
  'stacking-pool-fees',
];

// Remove duplicates while preserving order
const stackingFaqPostKeys = Array.from(new Set(stackingFaqPostKeysRaw));

export function StackingFaq(props: HTMLStyledProps<'div'>) {
  // Filter posts to only those with a question and summary
  const faqPosts = stackingFaqPostKeys
    .map(key => content.posts[key] as Post)
    .filter(post => post && post.question && post.summary);

  return (
    <styled.div {...props}>
      <Accordion.Root
        type="single"
        defaultValue={faqPosts.length ? faqPosts[0].slug : undefined}
        collapsible
      >
        {faqPosts.map(post => (
          <Accordion.Item value={post.slug} key={post.slug}>
            <Accordion.Trigger>{sanitizeContent(post.question)}</Accordion.Trigger>
            <Accordion.Content>
              <styled.p textStyle="body.02" mb="space.02" style={{ whiteSpace: 'pre-line', color: 'black' }}>
                {sanitizeContent(post.summary)}{' '}
                <Link href={getPostHref(post.slug)} style={{ fontSize: 'inherit' }}>Learn more</Link>
              </styled.p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </styled.div>
  );
}
