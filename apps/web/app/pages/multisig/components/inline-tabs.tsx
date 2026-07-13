import { forwardRef } from 'react';

import { css } from 'leather-styles/css';
import { Tabs as RadixTabs } from 'radix-ui';

const rootStyles = css({
  display: 'flex',
  flexDirection: 'column',
});
const Root: typeof RadixTabs.Root = forwardRef((props, ref) => (
  <RadixTabs.Root className={rootStyles} ref={ref} {...props} />
));

Root.displayName = 'InlineTabs.Root';

const triggerStyles = css({
  position: 'relative',
  textStyle: 'label.01',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  py: 'space.04',
  px: 'space.04',
  userSelect: 'none',
  cursor: 'pointer',
  color: 'ink.text-subdued',
  _hover: { color: 'ink.text-primary' },
  '&[data-state="active"]': {
    color: 'ink.text-primary',
    _before: {
      content: '""',
      position: 'absolute',
      bottom: 0,
      height: '2px',
      width: '100%',
      bg: 'ink.text-subdued',
      zIndex: 10,
    },
  },
  _focusVisible: { outline: 0, _before: { bg: 'lightModeBlue.500' } },
});
const Trigger: typeof RadixTabs.Trigger = forwardRef((props, ref) => (
  <RadixTabs.Trigger className={triggerStyles} ref={ref} {...props} />
));

Trigger.displayName = 'InlineTabs.Trigger';

const listStyles = css({
  flexShrink: 0,
  display: 'flex',
  position: 'relative',
  _before: {
    content: '""',
    position: 'absolute',
    bottom: 0,
    height: '2px',
    width: '100%',
    bg: 'ink.border-default',
    zIndex: 9,
  },
});
const List: typeof RadixTabs.List = forwardRef((props, ref) => (
  <RadixTabs.List className={listStyles} ref={ref} {...props} />
));

List.displayName = 'InlineTabs.List';

export const InlineTabs = { Root, List, Trigger, Content: RadixTabs.Content };
