import type { Meta, StoryObj } from '@storybook/react';

import { BtcAvatarIcon } from '../avatar/btc-avatar-icon.native';
import { StxAvatarIcon } from '../avatar/stx-avatar-icon.native';
import { Box } from '../box/box.native';
import { Flag } from '../flag/flag.native';
import { AddressDisplayer as Component } from './address-displayer.native';

const meta: Meta<typeof Component> = {
  component: Component,
  title: 'AddressDisplayer',
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Bitcoin: Story = {
  args: {
    address: 'bc1pmzfrwwndsqmk5yh69yjr5lfgfg4ev8c0tsc06e',
  },
};

export const Stacks: Story = {
  args: {
    address: 'SP3XKZE32KZ925AAAGWPG1W66YP5BM2RD73T6AJHS',
  },
};

export const WithBtcIcon: Story = {
  args: {
    address: 'bc1pmzfrwwndsqmk5yh69yjr5lfgfg4ev8c0tsc06e',
  },
  render: args => (
    <Flag img={<BtcAvatarIcon />}>
      <Box flexDirection="row" flexWrap="wrap">
        <Component address={args.address} />
      </Box>
    </Flag>
  ),
};

export const WithStxIcon: Story = {
  args: {
    address: 'SP3XKZE32KZ925AAAGWPG1W66YP5BM2RD73T6AJHS',
  },
  render: args => (
    <Flag img={<StxAvatarIcon />}>
      <Box flexDirection="row" flexWrap="wrap">
        <Component address={args.address} />
      </Box>
    </Flag>
  ),
};
