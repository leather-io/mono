import { defineGlobalStyles } from '@pandacss/dev';

// https://unpkg.com/nprogress@0.2.0/nprogress.css
export const globalLoaderCss = defineGlobalStyles({
  '#nprogress': {
    pointerEvents: 'none',
  },

  '#nprogress .bar': {
    background: 'black',
    position: 'fixed',
    zIndex: 99999,
    top: 0,
    left: 0,
    width: '100%',
    height: '1px',
  },

  '#nprogress .peg': {
    display: 'block',
    position: 'absolute',
    right: '0px',
    width: '100px',
    height: '100%',
    opacity: 1.0,
    transform: 'rotate(3deg) translate(0px, -4px)',
  },

  '#nprogress .spinner': {
    display: 'block',
    position: 'fixed',
    zIndex: 1031,
    top: '15px',
    right: '15px',
  },

  '.nprogress-custom-parent': {
    overflow: 'hidden',
    position: 'relative',
  },
});
