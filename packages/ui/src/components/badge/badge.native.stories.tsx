import type { Meta, StoryObj } from '@storybook/react';

import { Box } from '../../../native';
import { Badge } from './badge.native';

const meta: Meta<typeof Badge> = {
  title: 'Badge',
  component: Badge,
  decorators: [
    Story => (
      <Box flexDirection="row" p="5">
        <Story />
      </Box>
    ),
  ],
};

export default meta;

export const Default = {
  args: {
    label: 'Default',
  },
} satisfies StoryObj<typeof Badge>;

export const Info = {
  args: {
    label: 'Info',
    variant: 'info',
  },
} satisfies StoryObj<typeof Badge>;

export const Success = {
  args: {
    label: 'Success',
    variant: 'success',
  },
} satisfies StoryObj<typeof Badge>;

export const Warning = {
  args: {
    label: 'Warning',
    variant: 'warning',
  },
} satisfies StoryObj<typeof Badge>;

export const Error = {
  args: {
    label: 'Error',
    variant: 'error',
  },
} satisfies StoryObj<typeof Badge>;
