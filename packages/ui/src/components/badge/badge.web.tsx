import type { ReactNode } from 'react';

import { type RecipeVariantProps, cva } from 'leather-styles/css';
import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

const badgeRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'space.01',
    borderRadius: 'round',
    maxWidth: 'fit-content',
    textStyle: 'label.03',
  },
  variants: {
    size: {
      sm: { px: 'space.02', py: '2px' },
      md: { px: 'space.02', py: 'space.01' },
    },
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
    size: 'sm',
    variant: 'default',
  },
});

type BadgeVariants = RecipeVariantProps<typeof badgeRecipe>;

interface BadgeOwnProps {
  icon?: ReactNode;
  label: string;
}

export type BadgeProps = BadgeOwnProps & BadgeVariants & HTMLStyledProps<'div'>;

export function Badge({ icon, label, outlined, size, variant, ...props }: BadgeProps) {
  return (
    <styled.div className={badgeRecipe({ outlined, size, variant })} {...props}>
      {icon}
      {label}
    </styled.div>
  );
}
