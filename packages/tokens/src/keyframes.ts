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
  spin: {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
  animatedTick: {
    from: {
      strokeDashoffset: 350,
    },
    to: {
      strokeDashoffset: 0,
    },
  },
  slideUpAndFade: {
    from: {
      opacity: 0,
      transform: 'translateY(2px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  slideRightAndFade: {
    from: {
      opacity: 0,
      transform: 'translateX(-2px)',
    },
    to: {
      opacity: 1,
      transform: 'translateX(0)',
    },
  },
  slideDownAndFade: {
    from: {
      opacity: 0,
      transform: 'translateY(-2px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
  slideLeftAndFade: {
    from: {
      opacity: 0,
      transform: 'translateX(2px)',
    },
    to: {
      opacity: 1,
      transform: 'translateX(0)',
    },
  },
} as const;
