import type { Meta, StoryObj } from '@storybook/react';

import { CloudOffIcon } from '../../icons/cloud-off-icon.native';
import { Box } from '../box/box.native';
import { Banner } from './banner.native';

const meta: Meta<typeof Banner> = {
  title: 'Banner',
  component: Banner,
  argTypes: {},
  parameters: {},
  decorators: [
    Story => (
      <Box mx="-2">
        <Story />
      </Box>
    ),
  ],
};

export default meta;

export const BannerStory = {
  args: {
    children:
      'Some balances are currently unavailable, which may impact the total balance displayed.',
    icon: <CloudOffIcon />,
  },
} satisfies StoryObj<typeof Banner>;
