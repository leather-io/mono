import type { Meta, StoryObj } from '@storybook/react';

import { Box } from '../../../native';
import { Chip } from './chip.native';

const meta: Meta<typeof Chip> = {
  title: 'Chip',
  component: Chip,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {},
  decorators: [
    Story => (
      <Box flexDirection="row">
        <Story />
      </Box>
    ),
  ],
};

export default meta;

export const ChipStory = {
  args: {
    label: 'Chip',
  },
  argTypes: {},
} satisfies StoryObj<typeof Chip>;
