import { styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { Accordion, Link } from '@leather.io/ui';
import { content } from '~/data/content';
import { getPostHref } from '~/utils/post-link';
import { sanitizeContent } from '~/utils/sanitize-content';

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
  // Filter posts to only those with a Question and Summary
  const faqPosts = stackingFaqPostKeys
    .map(key => (content.posts as Record<string, any>)[key])
    .filter(post => post && post.Question && post.Summary);

  return (
    <styled.div {...props}>
      <Accordion.Root
        type="single"
        defaultValue={faqPosts.length ? faqPosts[0].Slug : undefined}
        collapsible
      >
        {faqPosts.map(post => (
          <Accordion.Item value={post.Slug} key={post.Slug}>
            <Accordion.Trigger>{sanitizeContent(post.Question)}</Accordion.Trigger>
            <Accordion.Content>
              <styled.p textStyle="body.02" mb="space.02" style={{ whiteSpace: 'pre-line', color: 'black' }}>
                {sanitizeContent(post.Summary)}{' '}
                <Link href={getPostHref(post.Slug)} style={{ fontSize: 'inherit' }}>Learn more</Link>
              </styled.p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </styled.div>
  );
}
