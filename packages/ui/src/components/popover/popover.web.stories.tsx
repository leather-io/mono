import type { Meta, StoryObj } from '@storybook/react';
import { styled } from 'leather-styles/jsx';

import { Button } from '../button/button.web';
import { Popover as Component } from './popover.web';

const meta: Meta<typeof Component.Root> = {
  component: Component.Root,
  tags: ['autodocs'],
  title: 'Popover',
};

export default meta;
type Story = StoryObj<typeof Component.Root>;

export const Popover: Story = {
  render: () => (
    <Component.Root>
      <Component.Trigger asChild>
        <Button>Open popover</Button>
      </Component.Trigger>
      <Component.Portal>
        <Component.Content>
          <Component.Arrow />
          <styled.p textStyle="label.02">Popover content</styled.p>
          <styled.p textStyle="body.02" color="ink.text-subdued">
            This is a popover with some example content.
          </styled.p>
        </Component.Content>
      </Component.Portal>
    </Component.Root>
  ),
};

export const WithClose: Story = {
  render: () => (
    <Component.Root>
      <Component.Trigger asChild>
        <Button>Open popover</Button>
      </Component.Trigger>
      <Component.Portal>
        <Component.Content>
          <styled.p textStyle="label.02">Dismissible popover</styled.p>
          <styled.p textStyle="body.02" color="ink.text-subdued">
            Click the button below to close.
          </styled.p>
          <Component.Close asChild>
            <Button variant="outline">Close</Button>
          </Component.Close>
        </Component.Content>
      </Component.Portal>
    </Component.Root>
  ),
};
