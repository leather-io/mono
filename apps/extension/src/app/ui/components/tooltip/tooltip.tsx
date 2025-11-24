import { forwardRef } from 'react';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import { css } from 'leather-styles/css';

function Root(props: RadixTooltip.TooltipProps) {
  return <RadixTooltip.Root {...props} />;
}

function Portal(props: RadixTooltip.TooltipPortalProps) {
  return <RadixTooltip.Portal {...props} />;
}

const Trigger: typeof RadixTooltip.Trigger = forwardRef(function Trigger(props, ref) {
  return <RadixTooltip.Trigger ref={ref} {...props} />;
});

const Content: typeof RadixTooltip.Content = forwardRef(function Content(
  { className, ...props },
  ref
) {
  return (
    <RadixTooltip.Content className={`${defaultContentStyles} ${className}`} ref={ref} {...props} />
  );
});

const Arrow: typeof RadixTooltip.Arrow = forwardRef(function Arrow({ className, ...props }, ref) {
  return (
    <RadixTooltip.Arrow
      className={`${defaultTooltipArrowStyles} ${className}`}
      ref={ref}
      {...props}
    />
  );
});

export const Tooltip = {
  Root,
  Portal,
  Trigger,
  Content,
  Arrow,
};

const defaultContentStyles = css({
  bg: 'ink.action-primary-default',
  borderRadius: 'xs',
  px: 'space.03',
  py: 'space.02',
  textStyle: 'body.02',
  animationDuration: '400ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  willChange: 'transform, opacity',
  maxWidth: '250px',
  textAlign: 'center',
  wordWrap: 'break-word',
  color: 'ink.background-primary',
  zIndex: 4,

  "&[data-state='delayed-open'][data-side='top']": {
    animationName: 'slideDownAndFade',
  },
  "&[data-state='delayed-open'][data-side='right']": {
    animationName: 'slideLeftAndFade',
  },
  "&[data-state='delayed-open'][data-side='bottom']": {
    animationName: 'slideUpAndFade',
  },
  "&[data-state='delayed-open'][data-side='left']": {
    animationName: 'slideRightAndFade',
  },
});

const defaultTooltipArrowStyles = css({
  fill: 'ink.action-primary-default',
});
