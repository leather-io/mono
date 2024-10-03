import { Meta, StoryObj } from '@storybook/react';
import { Box, Circle } from 'leather-styles/jsx';

import { Flag as Component } from './flag.web';

const meta: Meta<typeof Component> = {
  component: Component,
  tags: ['autodocs'],
  title: 'Layout/Flag',
  argTypes: {
    spacing: {
      options: ['space.01', 'space.02', 'space.03', 'space.04', 'space.05', 'space.06', 'space.07'],
      control: { type: 'radio' },
      defaultValue: 'space.03',
    },
    align: {
      options: ['top', 'middle', 'bottom'],
      control: { type: 'radio' },
      defaultValue: 'middle',
    },
    reverse: {
      control: { type: 'boolean' },
      defaultValue: false,
    },
  },
  parameters: {
    controls: { include: ['align', 'spacing', 'reverse'] },
  },
  render: ({ children, ...args }) => (
    <Box width="350px">
      <Component {...args} img={<Circle size="40px" backgroundColor="ink.text-non-interactive" />}>
        {children}
      </Component>
    </Box>
  ),
};

export default meta;

type Story = StoryObj<typeof Component>;

export const Flag: Story = {
  args: {
    children: <Box width="300px" height="20px" backgroundColor="ink.text-non-interactive" />,
  },
};
