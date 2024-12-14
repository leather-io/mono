import { forwardRef } from 'react';

import * as RadixSwitch from '@radix-ui/react-switch';
import { css } from 'leather-styles/css';

const switchRootStyles = css({
  width: '42px',
  height: '24px',
  backgroundColor: 'ink.text-subdued',
  borderRadius: '9999px',
  position: 'relative',
  '&[data-state="checked"]': {
    backgroundColor: 'ink.text-primary',
  },
});

const switchThumbStyles = css({
  display: 'block',
  width: '18px',
  height: '18px',
  backgroundColor: 'ink.background-primary',
  borderRadius: '9999px',
  transition: 'transform 100ms',
  transform: 'translateX(3px)',
  willChange: 'transform',
  '&[data-state="checked"]': {
    transform: 'translateX(19px)',
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
