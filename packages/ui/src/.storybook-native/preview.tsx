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
      <View>
        <Story />
      </View>
    ),
  ],
};

export default preview;
