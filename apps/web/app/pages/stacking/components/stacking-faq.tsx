import { styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { stackingFaqItems } from '~/content/stacking-faq';
import { getPostHref } from '~/utils/post-link';
import { sanitizeContent } from '~/utils/sanitize-content';

import { Accordion, Link } from '@leather.io/ui';

export function StackingFaq(props: HTMLStyledProps<'div'>) {
  return (
    <styled.div {...props}>
      <Accordion.Root
        type="single"
        defaultValue={stackingFaqItems.length ? stackingFaqItems[0].id : undefined}
        collapsible
      >
        {stackingFaqItems.map(item => (
          <Accordion.Item value={item.id} key={item.id}>
            <Accordion.Trigger>{sanitizeContent(item.question)}</Accordion.Trigger>
            <Accordion.Content>
              <styled.p
                textStyle="body.02"
                mb="space.02"
                style={{ whiteSpace: 'pre-line', color: 'black' }}
              >
                {sanitizeContent(item.answer)}
                {item.learnMoreSlug && (
                  <>
                    {' '}
                    <Link href={getPostHref(item.learnMoreSlug)} style={{ fontSize: 'inherit' }}>
                      Learn more
                    </Link>
                  </>
                )}
              </styled.p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </styled.div>
  );
}
