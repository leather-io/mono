import { useLoaderData } from 'react-router';

import { styled } from 'leather-styles/jsx';
import { sbtcContent } from '~/content/sbtc-content';
import { type loader } from '~/pages/sbtc/sbtc.route';
import { getPostHref } from '~/utils/post-link';
import { sanitizeContent } from '~/utils/sanitize-content';

import { Accordion, Link } from '@leather.io/ui';

function getCurrentFaqAnswer(id: string, answer: string): string {
  if (
    id === '2d1e15c6-3371-4910-968b-86638d7e6192' &&
    answer.includes('currently expected on September 9, 2026')
  ) {
    return `${sbtcContent.rewardsSunset.title}. ${sbtcContent.rewardsSunset.description}`;
  }
  return answer;
}

export function SbtcRewardsFaq() {
  const { sbtcFaq } = useLoaderData<typeof loader>();

  if (!sbtcFaq) {
    return null;
  }

  const { faqBuilder } = sbtcFaq;
  return (
    <styled.div mb="space.07">
      <Accordion.Root
        type="single"
        defaultValue={faqBuilder.length ? faqBuilder[0]._id : undefined}
        collapsible
      >
        {faqBuilder.map(post => (
          <Accordion.Item value={post._id} key={post._id}>
            <Accordion.Trigger>{sanitizeContent(post.question)}</Accordion.Trigger>
            <Accordion.Content>
              <styled.div
                textStyle="body.02"
                mb="space.02"
                style={{ whiteSpace: 'pre-line', color: 'black' }}
              >
                {sanitizeContent(getCurrentFaqAnswer(post._id, post.answer))}
                <br />
                <br />
                <Link
                  href={getPostHref(post.legacyPost?.slug.current)}
                  style={{ fontSize: 'inherit', whiteSpace: 'nowrap' }}
                >
                  Learn more
                </Link>
              </styled.div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </styled.div>
  );
}
