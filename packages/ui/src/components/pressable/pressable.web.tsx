import { type RecipeVariantProps, css, cva } from 'leather-styles/css';
import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

import { isDefined } from '@leather.io/utils';

const basePseudoOutlineProps = {
  content: '""',
  rounded: 'sm',
  position: 'absolute',
  top: '-space.03',
  left: '-space.03',
  bottom: '-space.03',
  right: '-space.03',
};

const focusVisibleStyles = {
  _before: {
    ...basePseudoOutlineProps,
    border: '2px solid',
    borderColor: 'lightModeBlue.500',
  },
  _focusWithin: { outline: 'none' },
};

export const pressableBaseStyles = css.raw({
  position: 'relative',
  bg: 'ink.background-primary',
  color: 'ink.text-primary',
  cursor: 'default',
  display: 'flex',
  height: 'auto',
  outline: 'none',
  rounded: 'sm',
  userSelect: 'none',
  width: '100%',
});

export const pressableStyles = css.raw({
  cursor: 'pointer',
  position: 'relative',
  _before: basePseudoOutlineProps,

  '&:is(:active)': {
    _before: {
      bg: 'ink.component-background-pressed',
    },
  },
  '&:is(:focus-visible)': {
    ...focusVisibleStyles,
  },
  '&:is(:disabled, [data-disabled])': {
    _active: { bg: 'unset' },
    _focus: { border: 'unset' },
    _hover: { bg: 'unset' },
    color: 'ink.text-non-interactive',
    cursor: 'not-allowed',
  },

  '&:is(:hover, [data-highlighted])': {
    _before: {
      bg: 'ink.component-background-hover',
      borderColor: 'transparent',
    },
  },
});

const pressableRecipe = cva({
  base: pressableBaseStyles,
  variants: {
    disabled: { true: {} },
    pressable: {
      true: pressableStyles,
    },
  },
});

export const pressableCaptionStyles = css({
  _groupDisabled: { color: 'ink.text-non-interactive' },
  color: 'ink.text-subdued',
});

export const pressableChevronStyles = css({
  _groupDisabled: { color: 'ink.text-non-interactive' },
  color: 'ink.action-primary-default',
});

type PressableVariantProps = RecipeVariantProps<typeof pressableRecipe>;

export function Pressable(props: HTMLStyledProps<'button'> & PressableVariantProps) {
  const { disabled, onClick, ref, ...rest } = props;
  const isPressable = isDefined(onClick);
  return (
    <styled.button
      className={`group ${pressableRecipe({ pressable: isPressable })}`}
      data-disabled={disabled}
      onClick={isPressable ? onClick : undefined}
      ref={ref}
      {...rest}
    />
  );
}
