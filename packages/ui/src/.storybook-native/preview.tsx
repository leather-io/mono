import { View } from 'react-native';

import { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },

  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          padding: 8,
        }}
      >
        <Story />
      </View>
    ),
  ],
};

export default preview;
