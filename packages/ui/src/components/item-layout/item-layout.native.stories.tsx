import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Box } from '../box/box.native';
import { ItemLayout } from './item-layout.native';

const meta: Meta<typeof ItemLayout> = {
  title: 'Layout/ItemLayout',
  component: ItemLayout,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {},
  decorators: [
    Story => (
      <View style={{ height: 40 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

export const ItemLayoutStory = {
  args: {
    captionLeft: 'Hello',
    captionRight: 'World',
    flagImg: <Box style={{ flex: 1, backgroundColor: 'green' }} />,
    showChevron: true,
    titleRight: 'Goodbye',
    titleLeft: 'World',
  },
  argTypes: {},
} satisfies StoryObj<typeof ItemLayout>;
