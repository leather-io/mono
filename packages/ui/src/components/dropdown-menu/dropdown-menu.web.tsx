import { forwardRef } from 'react';

import { css } from 'leather-styles/css';
import { type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { DropdownMenu as RadixDropdownMenu } from 'radix-ui';

import { pressableBaseStyles, pressableStyles } from '../../components/pressable/pressable.web';
import { ChevronDownIcon } from '../../icons/index.web';
import { Flag } from '../flag/flag.web';

const dropdownButtonStyles = css({
  bg: 'ink.background-primary',
  borderRadius: 'xs',
  fontWeight: 500,
  maxWidth: 'fit-content',
  maxHeight: 'fit-content',
  px: 'space.04',
  py: 'space.03',
  textStyle: 'label.02',
  userSelect: 'none',
  '[data-state=open] &': { bg: 'ink.component-background-pressed' },
});

function Button({ children, ...props }: HTMLStyledProps<'div'>) {
  return (
    <styled.div className={dropdownButtonStyles} {...props}>
      <Flag spacing="space.02" reverse img={<ChevronDownIcon variant="small" />}>
        {children}
      </Flag>
    </styled.div>
  );
}

const dropdownIconButtonStyles = css({
  _hover: { bg: 'ink.component-background-hover' },
  _focus: { outline: 'none' },
  borderRadius: 'sm',
  p: 'space.02',

  '&[data-state=open]': { bg: 'ink.component-background-pressed' },
});
const IconButton: typeof RadixDropdownMenu.Trigger = forwardRef((props, ref) => (
  <RadixDropdownMenu.Trigger className={dropdownIconButtonStyles} ref={ref} {...props} />
));

IconButton.displayName = 'DropdownMenu.IconButton';

const dropdownTriggerStyles = css({
  _focus: { outline: 'none' },
});

const Trigger: typeof RadixDropdownMenu.Trigger = forwardRef((props, ref) => (
  <RadixDropdownMenu.Trigger className={dropdownTriggerStyles} ref={ref} {...props} />
));

Trigger.displayName = 'DropdownMenu.Trigger';

const dropdownContentStyles = css({
  alignItems: 'center',
  '--base-menu-padding': '0px',
  bg: 'ink.background-primary',
  borderRadius: 'sm',
  // TODO: remove this boxShadow once we release home screen revamp
  boxShadow: 'elevationLight',
  p: '0',
  willChange: 'transform, opacity',
  zIndex: 999,
  animationDuration: '160ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  animationName: 'slideUpAndFade',
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
const ContentBase: typeof RadixDropdownMenu.Content = forwardRef(({ className, ...props }, ref) => (
  <RadixDropdownMenu.Content
    className={`${dropdownContentStyles} ${className}`}
    ref={ref}
    {...props}
  />
));

ContentBase.displayName = 'DropdownMenu.Content';

const Content = styled(ContentBase);

const dropdownMenuLabelStyles = css({
  color: 'ink.text-subdued',
  height: 'auto',
  px: 'space.03',
  py: 'space.02',
  textStyle: 'body.02',
  width: '100%',
});
const Label: typeof RadixDropdownMenu.Label = forwardRef((props, ref) => (
  <RadixDropdownMenu.Label className={dropdownMenuLabelStyles} ref={ref} {...props} />
));

Label.displayName = 'DropdownMenu.Label';

const dropdownItemStyles = css({ p: 'space.03' });
const Item: typeof RadixDropdownMenu.Item = forwardRef((props, ref) => (
  <styled.div className={dropdownItemStyles}>
    <RadixDropdownMenu.Item
      ref={ref}
      className={css(pressableBaseStyles, pressableStyles)}
      {...props}
    />
  </styled.div>
));

Item.displayName = 'DropdownMenu.Item';

const dropdownMenuSeparatorStyles = css({
  bg: 'ink.background-primary',
  color: 'ink.border-default',
  mx: '0px',
  my: 'space.03',
});
const Separator: typeof RadixDropdownMenu.Separator = forwardRef((props, ref) => (
  <RadixDropdownMenu.Separator className={dropdownMenuSeparatorStyles} ref={ref} {...props} />
));

Separator.displayName = 'DropdownMenu.Separator';

const dropdownMenuGroupStyles = css({
  p: 'space.02',
});

const Group: typeof RadixDropdownMenu.Group = forwardRef((props, ref) => (
  <RadixDropdownMenu.Separator className={dropdownMenuGroupStyles} ref={ref} {...props} />
));

Group.displayName = 'DropdownMenu.Group';

export const DropdownMenu = {
  Root: RadixDropdownMenu.Root,
  Group,
  Portal: RadixDropdownMenu.Portal,
  Trigger,
  Button,
  IconButton,
  Content,
  Label,
  Item,
  Separator,
};
