import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Box } from '../box/box.native';
import { Sheet } from './sheet.native';

const meta: Meta<typeof Sheet> = {
  title: 'Layout/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {},
  decorators: [
    Story => (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

export const SheetStory = {
  args: {
    children: <Box>Some sheet</Box>,
  },
  argTypes: {},
} satisfies StoryObj<typeof Sheet>;
