import { Meta, StoryObj } from '@storybook/react';

import { CloudOffIcon } from '../../icons/cloud-off-icon.web';
import { Callout } from './callout.web';

const meta: Meta<typeof Callout> = {
  component: Callout,
  tags: ['autodocs'],
  title: 'Callout',
  args: {
    variant: 'default',
  },
  parameters: {
    controls: { include: ['variant'] },
  },
  render: args => <Callout {...args} />,
};

export default meta;

type Story = StoryObj<typeof Callout>;

export const Basic: Story = {
  args: {
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
    title: 'Title',
  },
};

export const WithOnlyTitle: Story = {
  args: {
    title: 'Title',
  },
};

export const WithLongTitle: Story = {
  args: {
    title:
      'This is testing a really long title to see how it will look with no caption and two lines for the title',
  },
};

export const WithOnlyCaption: Story = {
  args: {
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.',
  },
};

export const WithShortCaption: Story = {
  args: {
    children: 'Short caption with no title.',
  },
};

export const WithCustomIcon: Story = {
  args: {
    title: 'Some balances are currently unavailable, which may impact the total balance displayed.',
    icon: <CloudOffIcon />,
    variant: 'warning',
  },
};
