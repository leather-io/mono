import type { Meta, StoryObj } from '@storybook/react';

import { ErrorCircleIcon } from '../../icons/index.web';
import { Badge as Component } from './badge.web';

const meta: Meta<typeof Component> = {
  component: Component,
  tags: ['autodocs'],
  title: 'Badge',
  parameters: {
    controls: { include: ['outlined', 'variant'] },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Badge: Story = {
  args: {
    label: 'Label',
    variant: 'default',
  },
};

export const WithIcon: Story = {
  args: {
    icon: <ErrorCircleIcon variant="small" />,
    label: 'Label',
    variant: 'default',
  },
};
