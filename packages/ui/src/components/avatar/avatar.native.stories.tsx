import type { Meta } from '@storybook/react';

import { Box, SettingsGearIcon } from '../../../native';
import BtcIcon from '../../assets/icons/bitcoin.svg';
import { Avatar } from './avatar.native';

const meta: Meta<typeof Avatar> = {
  title: 'Avatar',
  component: Avatar,
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
  render: () => {
    return <Avatar icon={<SettingsGearIcon />} />;
  },
};

export const Square = {
  render: () => {
    return <Avatar variant="square" icon={<SettingsGearIcon />} />;
  },
};

export const Image = {
  render: () => {
    return <Avatar variant="square" image="https://loremflickr.com/2280/720" fallback="LF" />;
  },
};

export const Token = {
  render: () => {
    return <Avatar icon={<BtcIcon width="100%" height="100%" />} />;
  },
};

export const TokenWithSecondaryIndicator = {
  render: () => {
    return (
      <Avatar
        icon={<BtcIcon width="100%" height="100%" />}
        indicator={<BtcIcon width={16} height={16} />}
      />
    );
  },
};
