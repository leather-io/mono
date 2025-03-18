import { css } from 'leather-styles/css';

export const theadBorderBottom = css({
  _after: {
    content: '""',
    display: 'block',
    pos: 'absolute',
    width: '100%',
    left: 0,
    height: '1px',
    bg: 'ink.border-default',
  },
});
