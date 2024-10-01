import { Meta, StoryObj } from '@storybook/react';

import { ItemLayout as Component } from './item-layout.web';

const meta: Meta<typeof Component> = {
  component: Component,
  tags: ['autodocs'],
  title: 'Layout/Item',
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Item: Story = {
  render: () => (
    <Component
      img={<img width="24" height="24" src="./favicon.svg" />}
      titleLeft="titleLeft"
      captionLeft="captionLeft"
      titleRight="titleRight"
      captionRight="captionRight"
    />
  ),
};
