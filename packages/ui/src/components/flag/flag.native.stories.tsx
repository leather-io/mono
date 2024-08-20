import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Box } from '../box/box.native';
import { Flag } from './flag.native';

const meta: Meta<typeof Flag> = {
  title: 'Layout/Flag',
  component: Flag,
  tags: ['autodocs'],
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
  decorators: [
    Story => (
      <View style={{ height: 40 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

export const FlagStory = {
  args: {
    children: <Box style={{ flex: 1, backgroundColor: 'red' }} />,
    reverse: true,
    img: <Box style={{ flex: 1, backgroundColor: 'green' }} />,
  },
  argTypes: {},
} satisfies StoryObj<typeof Flag>;
