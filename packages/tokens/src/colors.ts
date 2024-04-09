export const colors = {
  current: { value: 'currentColor' },
  overlay: { value: 'rgba(0,0,0,0.4)' },
};

export interface Palette {
  'ink.text-primary': string;
  'ink.text-subdued': string;
  'ink.action-primary-hover': string;
  'ink.action-primary-default': string;
  'ink.border-transparent': string;
  'ink.border-default': string;
  'ink.non-interactive': string;
  'ink.component-background-pressed': string;
  'ink.component-background-hover': string;
  'ink.component-background-default': string;
  'ink.background-overlay': string;
  'ink.background-secondary': string;
  'ink.background-primary': string;

  'red.text-primary': string;
  'red.action-primary-default': string;
  'red.border': string;
  'red.background-secondary': string;
  'red.background-primary': string;

  'blue.text-primary': string;
  'blue.action-primary-default': string;
  'blue.border': string;
  'blue.background-secondary': string;
  'blue.background-primary': string;

  'yellow.text-primary': string;
  'yellow.action-primary-default': string;
  'yellow.border': string;
  'yellow.background-secondary': string;
  'yellow.background-primary': string;

  'green.text-primary': string;
  'green.action-primary-default': string;
  'green.border': string;
  'green.background-secondary': string;
  'green.background-primary': string;

  invert: string;
  stacks: string;
}

interface Colors {
  base: Palette;
  dark: Palette;
}

export const colorThemes = {
  base: {
    'ink.text-primary': '#12100F',
    'ink.text-subdued': '#948677',
    'ink.action-primary-hover': '#4A423B',
    'ink.action-primary-default': '#12100F',
    'ink.border-transparent': '#12100F1A',
    'ink.border-default': '#EAE5E0',
    'ink.non-interactive': '#D8CEC4',
    'ink.component-background-pressed': '#B1977B33',
    'ink.component-background-hover': '#B1977B1A',
    'ink.component-background-default': '#F5F1ED',
    'ink.background-overlay': '#12100F66',
    'ink.background-secondary': '#F5F1ED',
    'ink.background-primary': '#FFFFFF',

    'red.text-primary': '#38191A',
    'red.action-primary-default': '#FF2E3C',
    'red.border': '#FAC3C6',
    'red.background-secondary': '#FFABB1',
    'red.background-primary': '#FCEEED',

    'blue.text-primary': '#0C2644',
    'blue.action-primary-default': '#004EA6',
    'blue.border': '#B4D7FF',
    'blue.background-secondary': '#9BCAFF',
    'blue.background-primary': '#E6F2FF',

    'yellow.text-primary': '#473D1C',
    'yellow.action-primary-default': '#A98D29',
    'yellow.border': '#FBE699',
    'yellow.background-secondary': '#F7CD33',
    'yellow.background-primary': '#FEF9E6',

    'green.text-primary': '#1A3124',
    'green.action-primary-default': '#00753A',
    'green.border': '#B2DFC8',
    'green.background-secondary': '#99D8B9',
    'green.background-primary': '#E6F5ED',

    invert: '#34312A',
    stacks: '#5546FF',
  } as const satisfies Palette,
  dark: {
    'ink.text-primary': '#F5F1ED',
    'ink.text-subdued': '#CFC8BB',
    'ink.action-primary-hover': '#CFC8BB',
    'ink.action-primary-default': '#F5F1ED',
    'ink.border-transparent': '#F5F1ED33',
    'ink.border-default': '#554D44',
    'ink.non-interactive': '#716A60',
    'ink.component-background-pressed': '#716A6073',
    'ink.component-background-hover': '#716A604D',
    'ink.component-background-default': '#24231E',
    'ink.background-overlay': '#12100F66',
    'ink.background-secondary': '#12100F',
    'ink.background-primary': '#1B1A17',

    'red.text-primary': '#34312A',
    'red.action-primary-default': '#FF2E3C',
    'red.border': '#AB1F29',
    'red.background-secondary': '#4F1A1D',
    'red.background-primary': '#38191A',

    'blue.text-primary': '#E6F2FF',
    'blue.action-primary-default': '#057AFF',
    'blue.border': '#004EA6',
    'blue.background-secondary': '#092F5A',
    'blue.background-primary': '#0C2644',

    'yellow.text-primary': '#FEF9E6',
    'yellow.action-primary-default': '#F5C000',
    'yellow.border': '#D8B021',
    'yellow.background-secondary': '#5C4F21',
    'yellow.background-primary': '#473D1C',

    'green.text-primary': '#E6F5ED',
    'green.action-primary-default': '#009E4F',
    'green.border': '#00753A',
    'green.background-secondary': '#19422C',
    'green.background-primary': '#1A3124',

    invert: '#FFFFFF',
    stacks: '#7F80FF',
  } as const satisfies Palette,
} as const satisfies Colors;
