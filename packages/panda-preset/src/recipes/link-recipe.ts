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
    textDecorationThickness: '2px',
    _before: {
      display: 'none',
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
        textDecoration: 'underline',
        _active: {
          color: 'ink.text-primary',
        },
        _focus: {
          textDecorationColor: 'blue.border',
          outline: 0,
        },
        _hover: {
          textDecorationColor: 'ink.text-primary',
        },
        textDecorationColor: 'ink.text-non-interactive',
      },

      text: {
        _active: {
          color: 'ink.text-primary',
          textDecoration: 'underline',
        },
        _focus: {
          color: 'ink.text-primary',
          outline: 0,
          textDecoration: 'underline',
        },
        _hover: {
          textDecoration: 'underline',
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
        outline: 0,
        textDecoration: 'underline',
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
        textDecoration: 'underline',
      },
    },
    {
      disabled: true,
      variant: 'text',
      css: {
        color: 'ink.text-non-interactive',
        cursor: 'not-allowed',
        textDecoration: 'none',
      },
    },
  ],
});
