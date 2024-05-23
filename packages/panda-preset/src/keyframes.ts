import { keyframes as leatherKeyframes } from '@leather-wallet/tokens';

// TODO investigate if this can be move into tokens?
export const keyframes = {
  ...leatherKeyframes,
  slideDownAndOut: {
    from: { opacity: 1, transform: 'translateY(0)' },
    to: { opacity: 0, transform: 'translateY(4px)' },
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
};
