import { styled } from 'leather-styles/jsx';
import { sbtcFaq } from '~/pages/sbtc/sbtc.data';
import { getPostHref } from '~/utils/post-link';
import { sanitizeContent } from '~/utils/sanitize-content';

import { Accordion, Link } from '@leather.io/ui';

export function SbtcRewardsFaq() {
  return (
    <styled.div mb="space.07">
      <Accordion.Root
        type="single"
        defaultValue={sbtcFaq.length ? sbtcFaq[0].slug : undefined}
        collapsible
      >
        {sbtcFaq.map(post => (
          <Accordion.Item value={post.slug} key={post.slug}>
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
                  href={getPostHref(post.slug)}
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
