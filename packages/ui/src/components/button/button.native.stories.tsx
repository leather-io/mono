import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button.native';

const meta: Meta<typeof Button> = {
  title: 'Button',
  component: Button,
  decorators: [
    Story => (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

export const ButtonStory = {
  args: {
    onPress: () => {},
    title: 'Submit',
    buttonState: 'default',
  },
  argTypes: {},
} satisfies StoryObj<typeof Button>;
