import type { Meta, StoryObj } from '@storybook/react';

import { ArrowDownIcon as Icon } from '../arrow-down-icon.web';

const meta: Meta<typeof Icon> = {
  component: Icon,
  title: 'Icons/ExampleIcon',
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const ExampleIcon: Story = {
  args: {
    variant: 'small',
  },
  parameters: {
    controls: { include: ['variant'] },
  },
};
