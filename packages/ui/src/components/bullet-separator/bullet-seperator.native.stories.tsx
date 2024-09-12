import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '../../../native';
import { BulletSeparator } from './bullet-separator.native';

const meta: Meta<typeof BulletSeparator> = {
  title: 'BulletSeparator',
  component: BulletSeparator,
  tags: ['autodocs'],
};

export default meta;

export const BulletSeparatorStory = {
  render: () => (
    <BulletSeparator>
      <Text>Item 1</Text>
      <Text>Item 2</Text>
      <Text>Item 3</Text>
    </BulletSeparator>
  ),
} satisfies StoryObj<typeof BulletSeparator>;
