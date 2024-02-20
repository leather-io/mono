export const semanticTokens = {
  colors: {
    // Primitive colors defined as semantic tokens to match Radix
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
        value: { base: '{colors.transparentInk.2}', _dark: '{colors.transparentInk.2}' },
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
    red: {
      'text-primary': {
        value: { base: '{colors.darkModeRed.100}', _dark: '{colors.lightModeRed.100}' },
      },
      'action-primary-default': {
        value: { base: '{colors.darkModeRed.600}', _dark: '{colors.lightModeRed.600}' },
      },
      border: {
        value: { base: '{colors.lightModeRed.500}', _dark: '{colors.darkModeRed.600}' },
      },
      'background-secondary': {
        value: { base: '{colors.lightModeRed.300}', _dark: '{colors.darkModeRed.500}' },
      },
      'background-primary': {
        value: { base: '{colors.lightModeRed.100}', _dark: '{colors.darkModeRed.100}' },
      },
    },
    blue: {
      'text-primary': {
        value: { base: '{colors.darkModeBlue.100}', _dark: '{colors.lightModeBlue.100}' },
      },
      'action-primary-default': {
        value: { base: '{colors.darkModeBlue.600}', _dark: '{colors.lightModeBlue.600}' },
      },
      border: {
        value: { base: '{colors.lightModeBlue.500}', _dark: '{colors.darkModeBlue.600}' },
      },
      'background-secondary': {
        value: { base: '{colors.lightModeBlue.300}', _dark: '{colors.darkModeBlue.500}' },
      },
      'background-primary': {
        value: { base: '{colors.lightModeBlue.100}', _dark: '{colors.darkModeBlue.100}' },
      },
    },
    yellow: {
      'text-primary': {
        value: { base: '{colors.darkModeYellow.100}', _dark: '{colors.lightModeYellow.100}' },
      },
      'action-primary-default': {
        value: { base: '{colors.darkModeYellow.300}', _dark: '{colors.lightModeYellow.600}' },
      },
      border: {
        value: { base: '{colors.lightModeYellow.500}', _dark: '{colors.darkModeYellow.600}' },
      },
      'background-secondary': {
        value: { base: '{colors.lightModeYellow.300}', _dark: '{colors.darkModeYellow.300}' },
      },
      'background-primary': {
        value: { base: '{colors.lightModeYellow.100}', _dark: '{colors.darkModeYellow.100}' },
      },
    },
    green: {
      'text-primary': {
        value: { base: '{colors.darkModeGreen.100}', _dark: '{colors.lightModeGreen.100}' },
      },
      'action-primary-default': {
        value: { base: '{colors.darkModeGreen.600}', _dark: '{colors.lightModeGreen.600}' },
      },
      border: {
        value: { base: '{colors.lightModeGreen.500}', _dark: '{colors.darkModeGreen.600}' },
      },
      'background-secondary': {
        value: { base: '{colors.lightModeGreen.300}', _dark: '{colors.darkModeGreen.300}' },
      },
      'background-primary': {
        value: { base: '{colors.lightModeGreen.100}', _dark: '{colors.darkModeGreen.100}' },
      },
    },
    invert: {
      value: { base: '{colors.darkModeInk.1}', _dark: '{colors.lightModeInk.1}' },
    },
    stacks: {
      value: { base: '{colors.lightModeStacks}', _dark: '{colors.darkModeStacks}' },
    },
  },
} as const;
