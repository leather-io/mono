import type { Meta, StoryObj } from '@storybook/react';

import { ArrowDownIcon as Icon } from '../arrow-down-icon.web';

const meta: Meta<typeof Icon> = {
  component: Icon,
  title: 'Icons/ExampleIcon',
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const ExampleIcon: Story = {
  parameters: {
    controls: { include: ['variant'] },
  },
  args: { width: 'default' },
};
