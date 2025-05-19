import { HTMLStyledProps, styled } from 'leather-styles/jsx';
import { Accordion, Link } from '@leather.io/ui';
import { content } from '~/data/content';
import { getPostHref } from '~/utils/post-link';
import { sanitizeContent } from '~/utils/sanitize-content';

// List of sBTC-related post keys in order of appearance on the page
const sbtcFaqPostKeysRaw = [
  // Main heading
  'sbtc-rewards',
  // TVL and yield in value cards and tables
  'historical-yield',
  // Step 1: Get sBTC
  'sbtc-bridge',
  'stacks-swaps',
  // Step 2: Choose reward protocol (protocol grid)
  'sbtc-rewards-basic',
  'alex-sbtc-pools',
  'bitflow-sbtc-pools',
  'velar-sbtc-pools',
  'zest-sbtc-pools',
  // Table posts
  'total-locked-value-tvl',
  'sbtc-rewards-minimum-commitment',
  'sbtc-rewards-tokens',
];
const sbtcFaqPostKeys = Array.from(new Set(sbtcFaqPostKeysRaw));

export function SbtcRewardsFaq(props: HTMLStyledProps<'div'>) {
  // Filter posts to only those with a Question and Summary
  const faqPosts = sbtcFaqPostKeys
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
