export const semanticTokens = {
  colors: {
    ink: {
      'text-primary': {
        value: { base: '#12100F', _dark: '#F5F1ED' },
      },
      'text-subdued': {
        value: { base: '#948677', _dark: '#CFC8BB' },
      },
      'action-primary-hover': {
        value: { base: '#4A423B', _dark: '#716A604D' },
      },
      'action-primary-default': {
        value: { base: '#12100F', _dark: '#F5F1ED' },
      },
      'border-transparent': {
        value: { base: '#12100F1A', _dark: '#F5F1ED33' },
      },
      'border-default': {
        value: { base: '#EAE5E0', _dark: '#554D44' },
      },
      'non-interactive': {
        value: { base: '#D8CEC4', _dark: '#716A60' },
      },
      'component-background-pressed': {
        value: { base: '#B1977B33', _dark: '#716A6073' },
      },
      'component-background-hover': {
        value: { base: '#B1977B1A', _dark: '#716A604D' },
      },
      'component-background-default': {
        value: { base: '#F5F1ED', _dark: '#24231E' },
      },
      'background-overlay': {
        value: { base: '#12100F66', _dark: '#12100F66' },
      },
      'background-secondary': {
        value: { base: '#F5F1ED', _dark: '#12100F' },
      },
      'background-primary': {
        value: { base: '#FFFFFF', _dark: '#34312A' },
      },
    },
    red: {
      'text-primary': {
        value: { base: '#38191A', _dark: '#34312A' },
      },
      'action-primary-default': {
        value: { base: '#FF2E3C', _dark: '#FF2E3C' },
      },
      border: {
        value: { base: '#FAC3C6', _dark: '#AB1F29' },
      },
      'background-secondary': {
        value: { base: '#FFABB1', _dark: '#4F1A1D' },
      },
      'background-primary': {
        value: { base: '#FCEEED', _dark: '#38191A' },
      },
    },
    blue: {
      'text-primary': {
        value: { base: '#0C2644', _dark: '#E6F2FF' },
      },
      'action-primary-default': {
        value: { base: '#004EA6', _dark: '#057AFF' },
      },
      border: {
        value: { base: '#B4D7FF', _dark: '#004EA6' },
      },
      'background-secondary': {
        value: { base: '#9BCAFF', _dark: '#092F5A' },
      },
      'background-primary': {
        value: { base: '#E6F2FF', _dark: '#0C2644' },
      },
    },
    yellow: {
      'text-primary': {
        value: { base: '#473D1C', _dark: '#FEF9E6' },
      },
      'action-primary-default': {
        value: { base: '#A98D29', _dark: '#F5C000' },
      },
      border: {
        value: { base: '#FBE699', _dark: '#D8B021' },
      },
      'background-secondary': {
        value: { base: '#F7CD33', _dark: '#5C4F21' },
      },
      'background-primary': {
        value: { base: '#FEF9E6', _dark: '#473D1C' },
      },
    },
    green: {
      'text-primary': {
        value: { base: '#1A3124', _dark: '#E6F5ED' },
      },
      'action-primary-default': {
        value: { base: '#00753A', _dark: '#009E4F' },
      },
      border: {
        value: { base: '#B2DFC8', _dark: '#00753A' },
      },
      'background-secondary': {
        value: { base: '#99D8B9', _dark: '#19422C' },
      },
      'background-primary': {
        value: { base: '#E6F5ED', _dark: '#1A3124' },
      },
    },
    invert: {
      value: { base: '#34312A', _dark: '#FFFFFF' },
    },
    stacks: {
      value: { base: '#5546FF', _dark: '#7F80FF' },
    },
  },
} as const;
