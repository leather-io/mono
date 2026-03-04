export const colors = {
  current: { value: 'currentColor' },
  overlay: { value: 'rgba(0,0,0,0.4)' },
};

export interface Palette {
  'ink.text-primary': string;
  'ink.text-subdued-primary': string;
  'ink.text-subdued-secondary': string;
  'ink.text-non-interactive': string;
  'ink.action-primary-hover': string;
  'ink.action-primary-default': string;
  'ink.border-transparent': string;
  'ink.border-default': string;
  'ink.component-background-non-interactive': string;
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

type DarkPalette<T> = { [P in keyof T & string as `dark.${P}`]: T[P] };
type BasePalette<T> = { [P in keyof T & string as `base.${P}`]: T[P] };

export type AllThemePalette = DarkPalette<Palette> & BasePalette<Palette>;

interface Colors {
  base: Palette;
  dark: Palette;
}

export const colorThemes = {
  base: {
    'ink.text-primary': '#12100F',
    'ink.text-subdued-primary': '#5A5552',
    'ink.text-subdued-secondary': '#7B7572',
    'ink.text-non-interactive': '#9E9996',
    'ink.action-primary-hover': '#3A3634',
    'ink.action-primary-default': '#12100F',
    'ink.border-transparent': '#463f3c1a',
    'ink.border-default': '#E5E3E1',
    'ink.component-background-non-interactive': '#F1EFED',
    'ink.component-background-pressed': '#BEB0A733',
    'ink.component-background-hover': '#BEB0A71A',
    'ink.component-background-default': '#F1EFED',
    'ink.background-overlay': '#12100F66',
    'ink.background-secondary': '#F9F9F8',
    'ink.background-primary': '#FFFFFF',

    'red.text-primary': '#490A08',
    'red.action-primary-default': '#F0231B',
    'red.border': '#FFB8B3',
    'red.background-secondary': '#FF7A70',
    'red.background-primary': '#FFE9E8',

    'blue.text-primary': '#161F52',
    'blue.action-primary-default': '#5E80FF',
    'blue.border': '#C8D3FF',
    'blue.background-secondary': '#8FA7FF',
    'blue.background-primary': '#EEF3FF',

    'yellow.text-primary': '#4A3500',
    'yellow.action-primary-default': '#FFB919',
    'yellow.border': '#FFEFB4',
    'yellow.background-secondary': '#FFEFB4',
    'yellow.background-primary': '#FEF9E6',

    'green.text-primary': '#083826',
    'green.action-primary-default': '#1CBA7D',
    'green.border': '#A8EDD0',
    'green.background-secondary': '#5DD9A5',
    'green.background-primary': '#E7F8F1',

    invert: '#34312A',
    stacks: '#5546FF',
  } as const satisfies Palette,
  dark: {
    'ink.text-primary': '#F9F9F8',
    'ink.text-subdued-primary': '#EDEBE9',
    'ink.text-subdued-secondary': '#D9D6D4',
    'ink.text-non-interactive': '#9E9996',
    'ink.action-primary-hover': '#EDEBE9',
    'ink.action-primary-default': '#F9F9F8',
    'ink.border-transparent': '#F5F1ED33',
    'ink.border-default': '#46413E',
    'ink.component-background-non-interactive': '#46413E',
    'ink.component-background-pressed': '#716A6073',
    'ink.component-background-hover': '#716A604D',
    'ink.component-background-default': '#292623',
    'ink.background-overlay': '#12100FA6',
    'ink.background-secondary': '#1F1C1A',
    'ink.background-primary': '#12100F',

    'red.text-primary': '#FFE9E8',
    'red.action-primary-default': '#F0231B',
    'red.border': '#C81D17',
    'red.background-secondary': '#75100E',
    'red.background-primary': '#490A08',

    'blue.text-primary': '#EEF3FF',
    'blue.action-primary-default': '#5E80FF',
    'blue.border': '#4663E6',
    'blue.background-secondary': '#243485',
    'blue.background-primary': '#161F52',

    'yellow.text-primary': '#FEF9E6',
    'yellow.action-primary-default': '#FFB919',
    'yellow.border': '#B78100',
    'yellow.background-secondary': '#805B00',
    'yellow.background-primary': '#4A3500',

    'green.text-primary': '#E7F8F1',
    'green.action-primary-default': '#1CBA7D',
    'green.border': '#169E6A',
    'green.background-secondary': '#0D5C3D',
    'green.background-primary': '#083826',

    invert: '#FFFFFF',
    stacks: '#7F80FF',
  } as const satisfies Palette,
} as const satisfies Colors;
