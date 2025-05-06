export const keyframes = {
  contentShow: {
    from: {
      opacity: 0,
      transform: 'translate(-50%, -48%) scale(0.96)',
    },
    to: {
      opacity: 1,
      transform: 'translate(-50%, -50%) scale(1)',
    },
  },
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
  slideDownAndOut: {
    from: { opacity: 1, transform: 'translateY(0)' },
    to: { opacity: 0, transform: 'translateY(4px)' },
  },
  slideUpAndOut: {
    from: { opacity: 1, transform: 'translateY(0)' },
    to: { opacity: 0, transform: 'translateY(-4px)' },
  },
  slideLeftAndOut: {
    from: { opacity: 1, transform: 'translateX(0)' },
    to: { opacity: 0, transform: 'translateX(-4px)' },
  },
  slideRightAndOut: {
    from: { opacity: 1, transform: 'translateX(0)' },
    to: { opacity: 0, transform: 'translateX(4px)' },
  },
  slideDown: {
    from: { maxHeight: 0 },
    to: { maxHeight: '1000px' },
  },
  slideUp: {
    from: { maxHeight: '1000px' },
    to: { maxHeight: 0 },
  },
  toastAppear: {
    from: { opacity: 0, transform: 'translateY(-12px) scale(0.9)' },
    to: { opacity: 1, transform: 'translateY(0) scale(1)' },
  },
  shimmer: {
    '100%': {
      maskPosition: 'left',
    },
  },
} as const;
