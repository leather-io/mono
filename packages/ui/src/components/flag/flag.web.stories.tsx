import { Meta, StoryObj } from '@storybook/react';
import { Box } from 'leather-styles/jsx';

import { Flag as Component } from './flag.web';

const meta: Meta<typeof Component> = {
  component: Component,
  tags: ['autodocs'],
  title: 'Layout/Flag',
  argTypes: {
    align: {
      options: ['top', 'middle', 'bottom'],
      control: { type: 'radio' },
      defaultValue: 'middle',
    },
  },
  parameters: {
    controls: { include: ['align'] },
  },
  render: ({ children, ...args }) => (
    <Component {...args} img={<img width="24" height="24" src="./favicon.svg" />}>
      {children}
    </Component>
  ),
};

export default meta;

type Story = StoryObj<typeof Component>;

export const Flag: Story = {
  args: {
    children: <Box>Some flag content</Box>,
  },
};
