import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Box } from '../box/box.native';
import { Text } from '../text/text.native';
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
    children: (
      <Box backgroundColor="blue.background-primary" height={50}>
        <Text variant="label02">Hello</Text>
      </Box>
    ),
    reverse: false,
    img: <Box backgroundColor="green.background-primary" height={50} width={50} />,
  },
  argTypes: {},
} satisfies StoryObj<typeof Flag>;
