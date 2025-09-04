import { useLoaderData } from 'react-router';

import { styled } from 'leather-styles/jsx';
import { loader } from '~/pages/sbtc-rewards/sbtc.route';
import { getPostHref } from '~/utils/post-link';
import { sanitizeContent } from '~/utils/sanitize-content';

import { Accordion, Link } from '@leather.io/ui';

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
                {sanitizeContent(post.answer)}
                <br />
                <br />
                <Link
                  href={getPostHref(post.legacyPost?.slug.current)}
                  style={{ fontSize: 'inherit' }}
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
