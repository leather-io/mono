import type { Meta, StoryObj } from '@storybook/react';

import { ErrorCircleIcon } from '../../icons/index.web';
import { Tag as Component } from './tag.web';

const meta: Meta<typeof Component> = {
  component: Component,
  tags: ['autodocs'],
  title: 'Tag',
  parameters: {
    controls: { include: ['transparent', 'variant'] },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Tag: Story = {
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
