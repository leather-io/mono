import { definePreset } from '@pandacss/dev';

export default definePreset({
  theme: {
    extend: {
      tokens: {
        colors: {
          primary: { value: 'red' },
        },
      },
    },
  },
});
