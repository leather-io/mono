import { css } from 'leather-styles/css';
import { Popover as RadixPopover } from 'radix-ui';

function Root(props: RadixPopover.PopoverProps) {
  return <RadixPopover.Root {...props} />;
}

function Trigger(props: RadixPopover.PopoverTriggerProps) {
  return <RadixPopover.Trigger {...props} />;
}

function Anchor(props: RadixPopover.PopoverAnchorProps) {
  return <RadixPopover.Anchor {...props} />;
}

function Portal(props: RadixPopover.PopoverPortalProps) {
  return <RadixPopover.Portal {...props} />;
}

function Content({
  sideOffset = 8,
  collisionPadding = 12,
  ...props
}: RadixPopover.PopoverContentProps) {
  return (
    <RadixPopover.Content
      className={contentStyles}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      {...props}
    />
  );
}

function Close(props: RadixPopover.PopoverCloseProps) {
  return <RadixPopover.Close {...props} />;
}

function Arrow(props: RadixPopover.PopoverArrowProps) {
  return <RadixPopover.Arrow className={arrowStyles} {...props} />;
}

export const Popover = { Root, Trigger, Anchor, Portal, Content, Close, Arrow };

const contentStyles = css({
  bg: 'ink.background-primary',
  borderRadius: 'sm',
  boxShadow: 'elevationLight',
  p: 'space.04',
  willChange: 'transform, opacity',
  zIndex: '90',
  animationDuration: '160ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  '&[data-side="top"]': {
    _open: { animationName: 'slideUpAndFade' },
    _closed: { animation: 'slideDownAndOut' },
  },
  '&[data-side="bottom"]': {
    _open: { animationName: 'slideDownAndFade' },
    _closed: { animationName: 'slideUpAndOut' },
  },
  '&[data-side="left"]': {
    _open: { animationName: 'slideLeftAndFade' },
    _closed: { animationName: 'slideRightAndOut' },
  },
  '&[data-side="right"]': {
    _open: { animationName: 'slideRightAndFade' },
    _closed: { animationName: 'slideLeftAndOut' },
  },
});

const arrowStyles = css({
  fill: 'ink.background-primary',
});
