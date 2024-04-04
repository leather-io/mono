import { Palette, colorThemes } from './colors';

function createColorObjForKey<T extends keyof Palette>(key: T) {
  return { value: { base: colorThemes.base[key], _dark: colorThemes.dark[key] } };
}

export const semanticTokens = {
  colors: {
    ink: {
      'text-primary': createColorObjForKey('ink.text-primary'),
      'text-subdued': createColorObjForKey('ink.text-subdued'),
      'action-primary-hover': createColorObjForKey('ink.action-primary-hover'),
      'action-primary-default': createColorObjForKey('ink.action-primary-default'),
      'border-transparent': createColorObjForKey('ink.border-transparent'),
      'border-default': createColorObjForKey('ink.border-default'),
      'text-non-interactive': createColorObjForKey('ink.text-non-interactive'),
      'component-background-non-interactive': createColorObjForKey('ink.component-background-non-interactive'),
      'component-background-pressed': createColorObjForKey('ink.component-background-pressed'),
      'component-background-hover': createColorObjForKey('ink.component-background-hover'),
      'component-background-default': createColorObjForKey('ink.component-background-default'),
      'background-overlay': createColorObjForKey('ink.background-overlay'),
      'background-secondary': createColorObjForKey('ink.background-secondary'),
      'background-primary': createColorObjForKey('ink.background-primary'),
    },
    red: {
      'text-primary': createColorObjForKey('red.text-primary'),
      'action-primary-default': createColorObjForKey('red.action-primary-default'),
      border: createColorObjForKey('red.border'),
      'background-secondary': createColorObjForKey('red.background-secondary'),
      'background-primary': createColorObjForKey('red.background-primary'),
    },
    blue: {
      'text-primary': createColorObjForKey('blue.text-primary'),
      'action-primary-default': createColorObjForKey('blue.action-primary-default'),
      border: createColorObjForKey('blue.border'),
      'background-secondary': createColorObjForKey('blue.background-secondary'),
      'background-primary': createColorObjForKey('blue.background-primary'),
    },
    yellow: {
      'text-primary': createColorObjForKey('yellow.text-primary'),
      'action-primary-default': createColorObjForKey('yellow.action-primary-default'),
      border: createColorObjForKey('yellow.border'),
      'background-secondary': createColorObjForKey('yellow.background-secondary'),
      'background-primary': createColorObjForKey('yellow.background-primary'),
    },
    green: {
      'text-primary': createColorObjForKey('green.text-primary'),
      'action-primary-default': createColorObjForKey('green.action-primary-default'),
      border: createColorObjForKey('green.border'),
      'background-secondary': createColorObjForKey('green.background-secondary'),
      'background-primary': createColorObjForKey('green.background-primary'),
    },
    invert: createColorObjForKey('invert'),
    stacks: createColorObjForKey('stacks'),
  },
} as const;
