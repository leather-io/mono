import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Eye1ClosedIcon } from '@leather.io/ui/native';

import { Cell } from './cell.native';

const meta: Meta<typeof Cell> = {
  title: 'Layout/Cell',
  component: Cell,
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

export const CellStory = {
  args: {
    onPress: () => {},
    title: 'cell',
    Icon: Eye1ClosedIcon,
    variant: 'active',
  },
  argTypes: {},
} satisfies StoryObj<typeof Cell>;
