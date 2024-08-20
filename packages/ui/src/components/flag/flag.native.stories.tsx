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
    children: <Box flex={1} backgroundColor="blue.background-primary" />,
    reverse: false,
    img: <Box flex={1} backgroundColor="green.background-primary" />,
  },
  argTypes: {},
} satisfies StoryObj<typeof Flag>;
