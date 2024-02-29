import { CssKeyframes } from '@/leather-styles/types/system-types';
import { keyframes as leatherKeyframes } from '@leather-wallet/tokens';

// ts-unused-exports:disable-next-line
export const keyframes: CssKeyframes = {
  ...leatherKeyframes,
  slideDownAndOut: {
    from: { opacity: 1, transform: 'translateY(0)' },
    to: { opacity: 0, transform: 'translateY(4px)' },
  },
};
