import { ReactNode, forwardRef } from 'react';

import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';
import { Select as RadixSelect } from 'radix-ui';

import { pressableBaseStyles, pressableStyles } from '../../components/pressable/pressable.web';

export interface SelectItem {
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  label: string;
}

const selectTriggerStyles = css({
  alignItems: 'center',
  bg: 'ink.background-primary',
  borderRadius: 'xs',
  display: 'flex',
  fontWeight: 500,
  gap: 'space.02',
  maxWidth: 'fit-content',
  maxHeight: 'fit-content',
  px: 'space.04',
  py: 'space.03',
  textStyle: 'label.02',

  '&[data-state=open]': {
    bg: 'ink.component-background-pressed',
  },
});
const Trigger: typeof RadixSelect.Trigger = forwardRef((props, ref) => (
  <RadixSelect.Trigger className={selectTriggerStyles} ref={ref} {...props} />
));

Trigger.displayName = 'Select.Trigger';

const selectContentStyles = css({
  alignItems: 'center',
  animationDuration: '400ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  '--base-menu-padding': '0px',
  bg: 'ink.background-primary',
  borderRadius: 'xs',
  boxShadow:
    '0px 12px 24px 0px rgba(18, 16, 15, 0.08), 0px 4px 8px 0px rgba(18, 16, 15, 0.08), 0px 0px 2px 0px rgba(18, 16, 15, 0.08)',
  minWidth: '256px',
  p: 'space.02',
  willChange: 'transform, opacity',
  zIndex: 999,

  '&[data-side=bottom]': {
    animationName: 'slideUpAndFade',
  },
});
const Content: typeof RadixSelect.Content = forwardRef((props, ref) => (
  <RadixSelect.Content className={selectContentStyles} ref={ref} {...props} />
));

Content.displayName = 'Select.Content';

const selectViewportStyles = css({
  width: '100%',
});
const Viewport: typeof RadixSelect.Viewport = forwardRef((props, ref) => (
  <RadixSelect.Viewport className={selectViewportStyles} ref={ref} {...props} />
));

Viewport.displayName = 'Select.Viewport';

const selectLabelStyles = css({
  color: 'ink.text-subdued',
  height: 'auto',
  px: 'space.03',
  py: 'space.02',
  textStyle: 'body.02',
  width: '100%',
});

const Label: typeof RadixSelect.Label = forwardRef((props, ref) => (
  <RadixSelect.Label className={selectLabelStyles} ref={ref} {...props} />
));

Label.displayName = 'Select.Label';

const selectItemStyles = css({ p: 'space.03' });

const Item: typeof RadixSelect.Item = forwardRef((props, ref) => (
  <styled.div className={selectItemStyles}>
    <RadixSelect.Item className={css(pressableBaseStyles, pressableStyles)} ref={ref} {...props} />
  </styled.div>
));

Item.displayName = 'Select.Item';

const selectSeparatorStyles = css({
  bg: 'ink.background-primary',
  color: 'ink.border-default',
  mx: '0px',
  my: 'space.03',
});

const Separator: typeof RadixSelect.Separator = forwardRef((props, ref) => (
  <RadixSelect.Separator className={selectSeparatorStyles} ref={ref} {...props} />
));

Separator.displayName = 'Select.Separator';

export const Select = {
  Root: RadixSelect.Root,
  Value: RadixSelect.Value,
  Icon: RadixSelect.Icon,
  Portal: RadixSelect.Portal,
  Group: RadixSelect.Group,
  ItemText: RadixSelect.ItemText,
  ItemIndicator: RadixSelect.ItemIndicator,
  Trigger,
  Content,
  Viewport,
  Label,
  Item,
  Separator,
};
