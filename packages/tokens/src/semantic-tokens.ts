export const semanticTokens = {
  colors: {
    // Primitive colours defined as semantic tokens to match Radix
    ink: {
      1: { value: { base: '{colors.lightModeInk.1}', _dark: '{colors.darkModeInk.1}' } },
      2: { value: { base: '{colors.lightModeInk.2}', _dark: '{colors.darkModeInk.2}' } },
      3: { value: { base: '{colors.lightModeInk.3}', _dark: '{colors.darkModeInk.3}' } },
      4: { value: { base: '{colors.lightModeInk.4}', _dark: '{colors.darkModeInk.4}' } },
      5: { value: { base: '{colors.lightModeInk.5}', _dark: '{colors.darkModeInk.5}' } },
      6: { value: { base: '{colors.lightModeInk.6}', _dark: '{colors.darkModeInk.6}' } },
      7: { value: { base: '{colors.lightModeInk.7}', _dark: '{colors.darkModeInk.7}' } },
      8: { value: { base: '{colors.lightModeInk.8}', _dark: '{colors.darkModeInk.8}' } },
      9: { value: { base: '{colors.lightModeInk.9}', _dark: '{colors.darkModeInk.9}' } },
      10: { value: { base: '{colors.lightModeInk.10}', _dark: '{colors.darkModeInk.10}' } },
      11: { value: { base: '{colors.lightModeInk.11}', _dark: '{colors.darkModeInk.11}' } },
      12: { value: { base: '{colors.lightModeInk.12}', _dark: '{colors.darkModeInk.12}' } },
    },
    accent: {
      'text-primary': {
        value: { base: '{colors.lightModeInk.12}', _dark: '{colors.darkModeInk.12}' },
      },
      'text-subdued': {
        value: { base: '{colors.lightModeInk.9}', _dark: '{colors.darkModeInk.11}' },
      },
      'action-primary-hover': {
        value: { base: '{colors.lightModeInk.11}', _dark: '{colors.darkModeInk.10}' },
      },
      'action-primary-default': {
        value: { base: '{colors.lightModeInk.12}', _dark: '{colors.darkModeInk.9}' },
      },
      'border-hover': {
        value: { base: '{colors.lightModeInk.5}', _dark: '{colors.darkModeInk.8}' },
      },
      'border-default': {
        value: { base: '{colors.lightModeInk.4}', _dark: '{colors.darkModeInk.7}' },
      },
      'non-interactive': {
        value: { base: '{colors.lightModeInk.7}', _dark: '{colors.darkModeInk.6}' },
      },
      'component-background-pressed': {
        value: { base: '{colors.lightModeInk.4}', _dark: '{colors.darkModeInk.5}' },
      },
      'component-background-hover': {
        value: { base: '{colors.transparentInk.2}', _dark: 'colors.transparentInk.2' },
      },
      'component-background-default': {
        value: { base: '{colors.lightModeInk.3}', _dark: '{colors.darkModeInk.3}' },
      },
      'background-secondary': {
        value: { base: '{colors.lightModeInk.3}', _dark: '{colors.darkModeInk.2}' },
      },
      'background-primary': {
        value: { base: '{colors.lightModeInk.1}', _dark: '{colors.darkModeInk.1}' },
      },
      'notification-text': {
        value: { base: '{colors.lightModeInk.12}', _dark: '{colors.darkModeInk.12}' },
      },
    },
    disabled: {
      value: { base: '{colors.lightModeBlue.100}', _dark: '{colors.darkModeBlue.100}' },
    },
    error: {
      background: {
        value: { base: '{colors.lightModeRed.100}', _dark: '{colors.darkModeRed.100}' },
      },
      label: {
        value: { base: '{colors.lightModeRed.600}', _dark: '{colors.darkModeRed.600}' },
      },
    },
    invert: {
      value: { base: '{colors.darkModeInk.1}', _dark: '{colors.lightModeInk.1}' },
    },
    stacks: {
      value: { base: '{colors.lightModeStacks}', _dark: '{colors.darkModeStacks}' },
    },
    success: {
      background: {
        value: { base: '{colors.lightModeGreen.100}', _dark: '{colors.darkModeGreen.100}' },
      },
      label: {
        value: { base: '{colors.lightModeGreen.600}', _dark: '{colors.darkModeGreen.600}' },
      },
    },
    warning: {
      background: {
        value: { base: '{colors.lightModeYellow.100}', _dark: '{colors.darkModeYellow.100}' },
      },
      label: {
        value: { base: '{colors.lightModeYellow.600}', _dark: '{colors.darkModeYellow.600}' },
      },
    },
  },
} as const;
