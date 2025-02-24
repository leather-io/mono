import { Component } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import BtcIcon from '../../assets/icons/bitcoin.svg';
import StacksIcon from '../../assets/icons/stacks.svg';
import { PlaceholderIcon } from '../../icons/placeholder-icon.web';
import { Avatar } from './avatar.web';
import { Brc20AvatarIcon } from './brc20-avatar-icon.web';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  tags: ['autodocs'],
  title: 'Avatar',
  parameters: {
    controls: { include: ['size', 'variant'] },
  },
  argTypes: {
    size: {
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      control: { type: 'select' },
    },
    variant: {
      options: ['circle', 'square'],
      control: { type: 'select' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Fallback: Story = {
  args: {
    fallback: 'B',
    size: 'lg',
    variant: 'square',
  },
};

export const Image: Story = {
  args: {
    fallback: 'AB',
    image: 'https://picsum.photos/id/15/2500/1667',
    variant: 'square',
  },
};

export const WithIcon: Story = {
  args: {
    icon: <PlaceholderIcon />,
    variant: 'circle',
  },
};

export const WithIndicator: Story = {
  args: {
    icon: <BtcIcon width="100%" height="100%" />,
    indicator: <StacksIcon width={16} height={16} />,
  },
};
