import type { Meta, StoryObj } from '@storybook/react';

import { Box, ChevronRightIcon } from '../../../native';
import { ItemLayout } from './item-layout.native';

const meta: Meta<typeof ItemLayout> = {
  title: 'Layout/ItemLayout',
  component: ItemLayout,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {},
  decorators: [
    Story => (
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Story />
      </Box>
    ),
  ],
};

export default meta;

export const ItemLayoutStory = {
  args: {
    actionIcon: <ChevronRightIcon color="ink.action-primary-default" variant="small" />,
    captionLeft: 'captionLeft',
    captionRight: 'captionRight',
    titleLeft: 'titleLeft',
    titleRight: 'titleRight',
  },
  argTypes: {},
} satisfies StoryObj<typeof ItemLayout>;
