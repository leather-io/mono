import { styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';
import { bitcoinStakingFaqItems } from '~/content/bitcoin-staking-faq';
import { sanitizeContent } from '~/utils/sanitize-content';

import { Accordion } from '@leather.io/ui';

export function StakingFaq(props: HTMLStyledProps<'div'>) {
  return (
    <styled.div {...props}>
      <Accordion.Root
        type="single"
        defaultValue={bitcoinStakingFaqItems.length ? bitcoinStakingFaqItems[0].id : undefined}
        collapsible
      >
        {bitcoinStakingFaqItems.map(item => (
          <Accordion.Item value={item.id} key={item.id}>
            <Accordion.Trigger>{sanitizeContent(item.question)}</Accordion.Trigger>
            <Accordion.Content>
              <styled.p
                textStyle="body.02"
                mb="space.02"
                style={{ whiteSpace: 'pre-line', color: 'black' }}
              >
                {sanitizeContent(item.answer)}
              </styled.p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </styled.div>
  );
}
