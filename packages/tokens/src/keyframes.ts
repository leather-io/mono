export const keyframes = {
  fadein: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  fadeout: {
    '0%': { opacity: '1' },
    '100%': { opacity: '0' },
  },
  shine: {
    '0%': {
      backgroundPosition: '-50px',
    },
    '100%': {
      backgroundPosition: '500px',
    },
  },
  rotate: {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
  spin: {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
} as const;
