import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Text } from './text.native';

const meta = {
  title: 'Text',
  component: Text,
  decorators: [
    Story => (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Text>;

export default meta;

// good example of argtypes: https://github.com/storybookjs/react-native/blob/next/examples/expo-example/components/ControlExamples/ControlExample/ControlExample.stories.tsx
export const TextStory = {
  args: {
    variant: 'body01',
    children: 'test text',
  },
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: {
        heading01: 'heading01',
        heading02: 'heading02',
        heading03: 'heading03',
        heading04: 'heading04',
        heading05: 'heading05',
        label01: 'label01',
        label02: 'label02',
        label03: 'label03',
        body01: 'body01',
        body02: 'body02',
        caption01: 'caption01',
        caption02: 'caption02',
        default: undefined,
      },
    },
    children: {
      control: { type: 'text' },
    },
  },
} satisfies StoryObj<typeof Text>;
