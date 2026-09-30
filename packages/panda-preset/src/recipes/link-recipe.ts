import { defineRecipe } from '@pandacss/dev';

export const linkRecipe = defineRecipe({
  description: 'The styles for the Link component',
  className: 'link',
  jsx: ['Link'],
  base: {
    appearance: 'none',
    display: 'inline',
    mb: 'space.01',
    p: 'unset',
    pt: 'space.01',
    textAlign: 'left',
    textUnderlineOffset: '3px',
    textDecorationThickness: '1px',
    outline: 'none',
    _focusVisible: {
      outline: '2px solid {colors.blue.action-primary-default}',
      outlineOffset: '2px',
      rounded: 'xs',
    },
  },

  variants: {
    size: {
      sm: {
        textStyle: 'label.03',
      },
      md: {
        textStyle: 'label.02',
      },
      lg: {
        textStyle: 'label.01',
      },
    },

    variant: {
      underlined: {
        textDecorationLine: 'underline',
        _active: {
          color: 'ink.text-primary',
        },
        _hover: {
          textDecorationColor: 'ink.text-primary',
        },
        textDecorationColor: 'ink.underline',
      },

      text: {
        _active: {
          color: 'ink.text-primary',
          textDecorationLine: 'underline',
        },
        _focus: {
          color: 'ink.text-primary',
          textDecorationLine: 'underline',
        },
        _hover: {
          textDecorationLine: 'underline',
        },
      },
    },

    invert: { true: {} },
    disabled: { true: {} },
    fullWidth: { true: { width: '100%' } },
  },

  defaultVariants: {
    size: 'md',
    variant: 'underlined',
  },

  compoundVariants: [
    {
      css: {
        color: 'ink.background-secondary',
        textDecorationLine: 'underline',
        textDecorationColor: 'currentColor',
      },
      invert: true,
      variant: 'underlined',
    },
    {
      disabled: true,
      variant: 'underlined',
      css: {
        color: 'ink.text-non-interactive',
        cursor: 'not-allowed',
        textDecorationLine: 'underline',
        textDecorationColor: 'currentColor',
      },
    },
    {
      disabled: true,
      variant: 'text',
      css: {
        color: 'ink.text-non-interactive',
        cursor: 'not-allowed',
        textDecorationLine: 'none',
      },
    },
  ],
});
