import React from 'react';

import { Meta, StoryFn, StoryObj } from '@storybook/react';

import { Accordion } from './accordion.web';

const meta: Meta<typeof Accordion.Root> = {
  component: Accordion.Root,
  tags: ['autodocs'],
  title: 'Components/Accordion',
};
export default meta;
type Story = StoryObj<typeof Accordion.Root>;

export const Template: StoryFn = args => (
  <Accordion.Root type="single" {...args}>
    <Accordion.Item value="item-1">
      <Accordion.Trigger>What is pooled stacking?</Accordion.Trigger>
      <Accordion.Content>
        Pooled stacking is a method that allows users with less than the minimum required STX
        (usually 100,000 STX per stacking slot) to participate in Stacking on the Stacks blockchain
        by combining their tokens with others. This is done through a Stacking pool, which manages
        the combined STX and participates in the network on behalf of all members
      </Accordion.Content>
    </Accordion.Item>
    <Accordion.Item value="item-2">
      <Accordion.Trigger>What does APR mean?</Accordion.Trigger>
      <Accordion.Content>
        APR stands for Annual Percentage Rate. It represents the yearly interest or return earned on
        an investment or paid on a loan, expressed as a percentage. In the context of crypto (like
        staking or stacking), APR shows how much you could earn over a year from your tokens,
        assuming compounding is not included. For example, if you stack STX with a 10% APR, you
        would earn 10% of your stacked amount in BTC over a year, assuming consistent rates.
      </Accordion.Content>
    </Accordion.Item>
    <Accordion.Item value="item-3">
      <Accordion.Trigger>What are the economics of stacking on Stacks</Accordion.Trigger>
      <Accordion.Content>
        Stacking on the Stacks blockchain involves locking STX tokens to support network consensus
        and earn rewards in Bitcoin (BTC). Participants contribute to securing the network through
        the Proof of Transfer (PoX) mechanism, which anchors Stacks blocks to Bitcoin. In return,
        stackers receive BTC payouts approximately every two weeks. The economic incentive depends
        on total STX locked, number of participants, and BTC sent by miners. <br /> <br />
        Higher STX locked means lower yield per user, while fewer participants can increase
        individual rewards. To stack, users must meet a minimum threshold (measured in "slots"), or
        join a pool to participate with fewer tokens.
      </Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>
);

export const Default: Story = {
  render: Template,
  args: {
    type: 'single',
    defaultValue: 'item-1',
    collapsible: true,
    onValueChange: (value: string) => {
      console.log('Selected value:', value);
    },
  },
};

Default.args = {
  type: 'single',
  defaultValue: 'item-1',
};
