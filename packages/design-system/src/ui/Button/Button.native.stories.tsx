import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Text.native';

const meta = {
  title: 'Button',
  component: Button,
  decorators: [
    Story => (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;

// good example of argtypes: https://github.com/storybookjs/react-native/blob/next/examples/expo-example/components/ControlExamples/ControlExample/ControlExample.stories.tsx
export const ButtonStory = {
  args: {
    variant: 'solid',
    size: 'medium',
    onPress: () => {},
    label: 'solid',
  },
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: {
        Medium: 'medium',
        Small: 'small',
      },
    },
    variant: {
      control: { type: 'radio' },
      options: {
        Solid: 'solid',
        Outline: 'outline',
        Ghost: 'ghost',
      },
    },
    label: {
      control: { type: 'text' },
    },
  },
} satisfies StoryObj<typeof Button>;
