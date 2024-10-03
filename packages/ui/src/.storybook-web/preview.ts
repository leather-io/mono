import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';
import type { Preview } from '@storybook/react';

import './index.css';

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: {
        ...INITIAL_VIEWPORTS,
        approver: {
          name: 'Approver Viewport',
          styles: {
            height: '680px',
            width: '390px',
          },
        },
      },
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    backgrounds: {
      default: 'leather-light-mode',
      values: [
        {
          name: 'leather-light-mode',
          value: '#FFFFFF',
        },
        {
          name: 'leather-dark-mode',
          value: '#12100F',
        },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
