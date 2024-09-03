import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '../text/text.native';
import { BlurView } from './blur-view.native';

const meta: Meta<typeof BlurView> = {
  title: 'BlurView',
  component: BlurView,
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
    children: <Text>Blur view</Text>,
  },
  argTypes: {},
} satisfies StoryObj<typeof BlurView>;
