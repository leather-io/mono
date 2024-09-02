import type { Meta, StoryObj } from '@storybook/react';

import { Eye1ClosedIcon } from '@leather.io/ui/native';

import { Cell } from './cell.native';

const meta: Meta<typeof Cell> = {
  title: 'Layout/Cell',
  component: Cell,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {},
  decorators: [Story => <Story />],
};

export default meta;

export const CellStory = {
  args: {
    onPress: () => {},
    title: 'Cell',
    subtitle: 'Subtitle',
    Icon: Eye1ClosedIcon,
    variant: 'active',
  },
  argTypes: {},
} satisfies StoryObj<typeof Cell>;

export const CellSwitchStory = {
  args: {
    onPress: () => {},
    title: 'Cell',
    subtitle: 'Subtitle',
    Icon: Eye1ClosedIcon,
    variant: 'switch',
    switchValue: true,
    toggleSwitchValue: () => {},
  },
  argTypes: {},
} satisfies StoryObj<typeof Cell>;
