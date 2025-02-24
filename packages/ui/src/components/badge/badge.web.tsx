import type { ReactNode } from 'react';

import { type RecipeVariantProps, cva } from 'leather-styles/css';
import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

const badgeRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'space.01',
    borderRadius: 'xs',
    maxWidth: 'fit-content',
    maxHeight: 24,
    p: 'space.01',
    textStyle: 'label.03',
  },
  variants: {
    variant: {
      default: {
        bg: 'ink.background-secondary',
        border: '1px solid {colors.ink.border-transparent}',
        color: 'ink.text-subdued',
      },
      error: {
        bg: 'red.background-primary',
        border: '1px solid {colors.red.border}',
        color: 'red.action-primary-default',
      },
      info: {
        bg: 'blue.background-primary',
        border: '1px solid {colors.blue.border}',
        color: 'blue.action-primary-default',
      },
      success: {
        bg: 'green.background-primary',
        border: '1px solid {colors.green.border}',
        color: 'green.action-primary-default',
      },
      warning: {
        bg: 'yellow.background-primary',
        border: '1px solid {colors.yellow.border}',
        color: 'yellow.action-primary-default',
      },
    },

    outlined: { true: { bg: 'transparent' } },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type BadgeVariants = RecipeVariantProps<typeof badgeRecipe>;

interface BadgeOwnProps {
  icon?: ReactNode;
  label: string;
}

export type BadgeProps = BadgeOwnProps & BadgeVariants & HTMLStyledProps<'div'>;

export function Badge({ icon, label, outlined, variant, ...props }: BadgeProps) {
  return (
    <styled.div className={badgeRecipe({ outlined, variant })} {...props}>
      {icon}
      {label}
    </styled.div>
  );
}
