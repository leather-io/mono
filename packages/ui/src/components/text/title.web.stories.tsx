import type { Meta, StoryObj } from '@storybook/react';

import { Title } from './title.web';

const meta: Meta<typeof Title> = {
  component: Title,
  tags: ['autodocs'],
  title: 'Title',
};

export default meta;
type Story = StoryObj<typeof Title>;

export const Default: Story = {
  render: () => <Title>Title</Title>,
};
