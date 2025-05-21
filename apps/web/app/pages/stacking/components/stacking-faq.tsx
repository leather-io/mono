import { styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { Accordion, Link } from '@leather.io/ui';
import { content } from '~/data/content';
import { getPostHref } from '~/utils/post-link';
import { sanitizeContent } from '~/utils/sanitize-content';
import type { Post } from '~/data/post-types';
import { getPosts } from '~/utils/post-utils';

// List of stacking-related post keys to use in the FAQ, ordered by appearance on the page
const stackingFaqPostKeysRaw = [
  // Main section headings
  'stacking',
  'pooledStacking',
  'liquidStacking',
  // Explainer steps (traditional and liquid)
  'stacksTokenStx',
  'stackingProviders',
  'stackingLockStx',
  'stackingRewards',
  'stackingLiquidToken',
  // Table posts (in order of table columns)
  'stackingProviders',
  'stackingRewardsTokens',
  'stackingMinimumCommitment',
  'historicalYield',
  'stackingPoolFees',
];

// Remove duplicates while preserving order
const stackingFaqPostKeys = Array.from(new Set(stackingFaqPostKeysRaw));

export function StackingFaq(props: HTMLStyledProps<'div'>) {
  // Get posts and filter out undefined/invalid posts
  const posts = getPosts();
  const faqPosts = stackingFaqPostKeys
    .map(key => posts[key])
    .filter((post): post is Post => Boolean(post && post.question && post.summary));

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
