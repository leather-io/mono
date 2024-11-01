import { useState } from 'react';
import { View } from 'react-native';

import type { Meta, StoryObj } from '@storybook/react';

import { Box } from '../box/box.native';
import { Text } from '../text/text.native';
import { Numpad } from './numpad.native';

const meta: Meta<typeof Numpad> = {
  title: 'Numpad',
  component: Numpad,
  decorators: [
    Story => (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

export const NumpadStory = {
  args: {
    value: '0',
    onChange() {},
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [displayAmount, setDisplayAmount] = useState('0');

    return (
      <Box flex={1} pt="2" pb="2">
        <Box flexGrow={1} p="5">
          <Text variant="heading02">{displayAmount}</Text>
        </Box>

        <Numpad value={displayAmount} onChange={setDisplayAmount} />
      </Box>
    );
  },
  argTypes: {
    value: {
      control: { type: 'text' },
    },
    onChange: { type: 'function' },
    mode: {
      control: {
        type: 'radio',
      },
      options: ['numeric', 'decimal'],
    },
    locale: {
      type: 'string',
    },
  },
} satisfies StoryObj<typeof Numpad>;
