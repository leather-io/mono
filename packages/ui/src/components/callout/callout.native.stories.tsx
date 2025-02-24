import type { Meta, StoryObj } from '@storybook/react';

import { CloudOffIcon } from '../../icons/cloud-off-icon.native';
import { Box } from '../box/box.native';
import { Callout } from './callout.native';

const meta: Meta<typeof Callout> = {
  title: 'Callout',
  component: Callout,
  decorators: Story => (
    <Box mx="-2">
      <Story />
    </Box>
  ),
};

export default meta;

export const Default = {
  args: {
    title: 'Title',
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
  },
} satisfies StoryObj<typeof Callout>;

export const Info = {
  args: {
    variant: 'info',
    title: 'Title',
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
  },
} satisfies StoryObj<typeof Callout>;

export const Success = {
  args: {
    variant: 'success',
    title: 'Title',
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
  },
} satisfies StoryObj<typeof Callout>;

export const Warning = {
  args: {
    variant: 'warning',
    title: 'Title',
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
  },
} satisfies StoryObj<typeof Callout>;

export const Error = {
  args: {
    variant: 'error',
    title: 'Title',
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
  },
} satisfies StoryObj<typeof Callout>;

export const CustomIcon = {
  args: {
    variant: 'warning',
    title: 'Title',
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
    icon: <CloudOffIcon />,
  },
} satisfies StoryObj<typeof Callout>;
