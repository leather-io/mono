/**
 * Central style tokens for consistent styling across the application
 * These tokens can be used in any component that needs to apply these styles
 */
export const styleTokens = {
  whiteSpace: {
    preLine: 'pre-line',
    nowrap: 'nowrap',
    normal: 'normal',
  },
  textDecoration: {
    underline: 'underline',
    none: 'none',
  },
  borderStyle: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    none: 'none',
  },
} as const;
