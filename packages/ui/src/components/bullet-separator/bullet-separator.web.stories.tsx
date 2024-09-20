import { Meta, StoryObj } from '@storybook/react';

import { Caption } from '../typography/caption.web';
import { Title } from '../typography/title.web';
import { BulletSeparator as Component } from './bullet-separator.web';

/**
 * Note that the BulletSeparator component doesn't bring it's own margins,
 * these should be applied separately
 */
const meta: Meta<typeof Component> = {
  component: Component,
  tags: ['autodocs'],
  title: 'BulletSeparator',
};

export default meta;
type Story = StoryObj<typeof Component>;

export const BulletSeparator: Story = {
  render: () => (
    <>
      <Component spacing="space.03">
        <span>Item 1</span>
        <span>Item 2</span>
        <span>Item 3</span>
      </Component>
    </>
  ),
};

export const WithCaption: Story = {
  render: () => (
    <Caption>
      <Component spacing="space.03">
        <span>Item 1</span>
        <span>Item 2</span>
        <span>Item 3</span>
      </Component>
    </Caption>
  ),
};

export const WithTitle: Story = {
  render: () => (
    <Title>
      <Component spacing="space.02">
        <span>Item 1</span>
        <span>Item 2</span>
        <span>Item 3</span>
      </Component>
    </Title>
  ),
};
