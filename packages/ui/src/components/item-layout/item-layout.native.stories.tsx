import type { Meta, StoryObj } from '@storybook/react';

import { Box } from '../../../native';
import { Eye1ClosedIcon } from '../../icons/eye-1-closed-icon.native';
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
    captionLeft: 'captionLeft',
    captionRight: 'captionRight',
    flagImg: <Eye1ClosedIcon />,
    showChevron: true,
    titleRight: 'titleRight',
    titleLeft: 'titleLeft',
  },
  argTypes: {},
} satisfies StoryObj<typeof ItemLayout>;
