import { forwardRef } from 'react';

import { css } from 'leather-styles/css';
import { HoverCard as RadixHoverCard } from 'radix-ui';

const hoverCardContentStyles = css({
  borderRadius: 'sm',
  padding: 'space.04',
  bg: 'ink.background-primary',
  maxWidth: '320px',
  textStyle: 'caption.01',
  zIndex: 1000,
  boxShadow:
    '0px 0px 2px 0px rgba(18, 16, 15, 0.12), 0px 4px 8px 0px rgba(18, 16, 15, 0.08), 0px 12px 24px 0px rgba(18, 16, 15, 0.08)',
  animationDuration: '320ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  willChange: 'transform, opacity',
  _closed: { opacity: 0 },
  '&[data-side="top"]': {
    animationName: 'slideDownAndFade',
    _open: { animationName: 'slideDownAndFade' },
    _closed: { animationName: 'slideUpAndOut' },
  },
  '&[data-side="bottom"]': {
    _open: { animationName: 'slideUpAndFade' },
    _closed: { animationName: 'slideDownAndOut' },
  },
  '&[data-side="left"]': {
    _open: { animationName: 'slideRightAndFade' },
    _closed: { animationName: 'slideLeftAndOut' },
  },
  '&[data-side="right"]': {
    _open: { animationName: 'slideLeftAndFade' },
    _closed: { animationName: 'slideRightAndOut' },
  },
});
const Content: typeof RadixHoverCard.Content = forwardRef((props, ref) => (
  <RadixHoverCard.Content className={hoverCardContentStyles} ref={ref} {...props} />
));

Content.displayName = 'HoverCard.Content';

const hoverCardArrowStyles = css({
  fill: 'ink.background-primary',
});
const Arrow: typeof RadixHoverCard.Arrow = forwardRef((props, ref) => (
  <RadixHoverCard.Arrow className={hoverCardArrowStyles} ref={ref} {...props} />
));

Arrow.displayName = 'HoverCard.Arrow';

export const HoverCard = {
  Root: RadixHoverCard.Root,
  Portal: RadixHoverCard.Portal,
  Trigger: RadixHoverCard.Trigger,
  Content,
  Arrow,
};
