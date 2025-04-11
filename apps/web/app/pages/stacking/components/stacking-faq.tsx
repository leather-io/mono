import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';
import { HTMLStyledProps } from 'leather-styles/types';

import { Accordion } from '@leather.io/ui';

export function StackingFaq(props: HTMLStyledProps<'div'>) {
  return (
    <styled.div {...props}>
      <Accordion.Root type="single" defaultValue="what-is-stacking">
        <Accordion.Item value="what-is-stacking">
          <Accordion.Trigger>What is stacking?</Accordion.Trigger>
          <Accordion.Content>
            Stacking is a mechanism on the Stacks blockchain that allows STX holders to support
            network consensus and earn rewards in Bitcoin (BTC). Unlike traditional staking,
            stacking works through a unique consensus model called Proof of Transfer (PoX), where
            STX holders lock their tokens temporarily to help secure the network and signal valid
            block producers. In return, they receive BTC rewards roughly every two weeks,
            distributed by miners who commit Bitcoin to participate in block creation. Stacking can
            be done individually or through pools, making it accessible to both large and small STX
            holders.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="pooled-stacking">
          <Accordion.Trigger>What is pooled stacking?</Accordion.Trigger>
          <Accordion.Content>
            Pooled stacking is a method that allows users with less than the minimum required STX
            (usually 100,000 STX per stacking slot) to participate in Stacking on the Stacks
            blockchain by combining their tokens with others. This is done through a Stacking pool,
            which manages the combined STX and participates in the network on behalf of all members
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="when-can-i-access-funds">
          <Accordion.Trigger>When can I access my funds again?</Accordion.Trigger>
          <Accordion.Content>
            Unlocking STX from pooled stacking typically takes about two weeks, corresponding to one
            Stacks reward cycle. When you delegate your STX to a pool, it is locked for a full
            cycle, and you can request to unlock it before the next cycle begins. However, the
            actual unlocking only occurs after the current cycle ends, meaning your STX remains
            locked until the protocol processes the unlock. Therefore, depending on when you
            initiate the unlock request within a cycle, it can take up to 2 weeks for your STX to
            become available again. Some pools may also have additional processing time or
            requirements, so exact timing can vary slightly by provider.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </styled.div>
  );
}
