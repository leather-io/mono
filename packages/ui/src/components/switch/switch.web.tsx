import { forwardRef } from 'react';

import { css } from 'leather-styles/css';
import { Switch as RadixSwitch } from 'radix-ui';

const switchRootStyles = css({
  width: '42px',
  height: '24px',
  backgroundColor: 'ink.background-primary',
  borderRadius: '9999px',
  borderColor: 'ink.border-default',
  borderWidth: 1,
  position: 'relative',
  '&[data-state="checked"]': {
    backgroundColor: 'ink.action-primary-default',
    borderColor: 'ink.action-primary-default',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'lightModeBlue.500',
    outlineOffset: '2px',
  },
});

const switchThumbStyles = css({
  display: 'block',
  width: '18px',
  height: '18px',
  backgroundColor: 'ink.text-non-interactive',
  borderRadius: '9999px',
  transition: 'transform 100ms',
  transform: 'translateX(3px)',
  willChange: 'transform',
  '&[data-state="checked"]': {
    transform: 'translateX(19px)',
    backgroundColor: 'ink.component-background-default',
  },
});

const Root: typeof RadixSwitch.Root = forwardRef((props, ref) => (
  <RadixSwitch.Root className={switchRootStyles} ref={ref} {...props} />
));

Root.displayName = 'Switch.Root';

const Thumb: typeof RadixSwitch.Thumb = forwardRef((props, ref) => (
  <RadixSwitch.Thumb className={switchThumbStyles} ref={ref} {...props} />
));

Thumb.displayName = 'Switch.Thumb';

export const Switch = { Root, Thumb };
