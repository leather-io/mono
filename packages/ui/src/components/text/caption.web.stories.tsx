import type { Meta, StoryObj } from '@storybook/react';

import { Caption } from './caption.web';

const meta: Meta<typeof Caption> = {
  component: Caption,
  tags: ['autodocs'],
  title: 'Caption',
};

export default meta;
type Story = StoryObj<typeof Caption>;

export const Default: Story = {
  render: () => <Caption>Caption</Caption>,
};
