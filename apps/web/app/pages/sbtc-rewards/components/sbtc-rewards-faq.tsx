import { HTMLStyledProps, styled } from 'leather-styles/jsx';
import { Accordion, Link } from '@leather.io/ui';
import { content } from '~/data/content';
import { getPostHref } from '~/utils/post-link';
import { sanitizeContent } from '~/utils/sanitize-content';
import type { Post } from '~/data/post-types';
import { getPosts } from '~/utils/post-utils';

// List of sBTC-related post keys in order of appearance on the page
const sbtcFaqPostKeysRaw = [
  // Main heading
  'sbtcRewards',
  // TVL and yield in value cards and tables
  'historicalYield',
  // Step 1: Get sBTC
  'sbtcBridge',
  'stacksSwaps',
  // Step 2: Choose reward protocol (protocol grid)
  'sbtcRewardsBasic',
  'alexSbtcPools',
  'bitflowSbtcPools',
  'velarSbtcPools',
  'zestSbtcPools',
  // Table posts
  'totalLockedValueTvl',
  'sbtcRewardsMinimumCommitment',
  'sbtcRewardsTokens',
];
const sbtcFaqPostKeys = Array.from(new Set(sbtcFaqPostKeysRaw));

export function SbtcRewardsFaq(props: HTMLStyledProps<'div'>) {
  // Get posts and filter out undefined/invalid posts
  const posts = getPosts();
  const faqPosts = sbtcFaqPostKeys
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
