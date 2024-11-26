import type { Meta, StoryObj } from '@storybook/react';
import { HStack, styled } from 'leather-styles/jsx';

import { ChevronDownIcon } from '../../icons/chevron-down-icon.web';
import { PlaceholderIcon } from '../../icons/placeholder-icon.web';
import { BtcAvatarIcon } from '../avatar/btc-avatar-icon.web';
import { Button as Component } from './button.web';

const meta: Meta<typeof Component> = {
  component: Component,
  tags: ['autodocs'],
  title: 'Button',
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Button: Story = {
  parameters: {
    controls: { include: ['size', 'variant'] },
  },
  args: {
    children: 'Button',
    size: 'md',
    variant: 'solid',
  },
};

export const Loading: Story = {
  parameters: {
    controls: { include: ['size', 'variant'] },
  },
  args: {
    'aria-busy': true,
    children: 'Button',
    size: 'md',
    variant: 'solid',
  },
};

export const Disabled: Story = {
  parameters: {
    controls: { include: ['size', 'variant'] },
  },
  args: {
    disabled: true,
    children: 'Button',
    size: 'md',
    variant: 'solid',
  },
};

export const WithIcons: Story = {
  parameters: {
    controls: { include: ['size', 'variant'] },
  },
  args: {
    children: (
      <HStack gap={Button.args?.size === 'md' ? 'space.02' : 'space.01'}>
        <PlaceholderIcon />
        <styled.span textStyle="label.02">Button</styled.span>
        <PlaceholderIcon />
      </HStack>
    ),
    size: 'md',
    variant: 'solid',
  },
};

export const WithToken: Story = {
  parameters: {
    controls: { include: [] },
  },
  args: {
    children: (
      <HStack>
        <BtcAvatarIcon />
        <styled.span textStyle="label.01">Button</styled.span>
        <ChevronDownIcon variant="small" />
      </HStack>
    ),
    trigger: true,
    variant: 'ghost',
  },
};
