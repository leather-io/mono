import React from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '../text/text.native';
import { Sheet } from './sheet.native';

const meta: Meta<typeof Sheet> = {
  title: 'Layout/Sheet',
  component: Sheet,
  tags: ['autodocs'],

  decorators: [
    Story => (
      <View style={{ height: 40 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

export const SheetStory = {
  args: {
    children: <Text>Some sheet</Text>,
    ref: null,
    themeVariant: 'light',
  },
  argTypes: {},
} satisfies StoryObj<typeof Sheet>;
