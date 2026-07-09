import type { ReactNode } from 'react';

import { cva } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';

export type BadgeVariant = 'default' | 'error' | 'info' | 'pending' | 'success' | 'warning';

const badge = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    width: 'fit-content',
    borderRadius: 'round',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  variants: {
    size: {
      md: {
        // Sized to match a size="sm" Button (32px, label.02) so a status chip and an
        // adjacent action button read as the same size class on a row.
        height: '32px',
        gap: 'space.02',
        pl: 'space.02',
        pr: 'space.03',
        textStyle: 'label.02',
      },
      sm: {
        height: '20px',
        gap: 'space.02',
        pl: 'space.02',
        pr: 'space.02',
        textStyle: 'caption.01',
      },
    },
    variant: {
      default: {
        bg: 'ink.background-secondary',
        borderColor: 'ink.border-transparent',
        color: 'ink.text-subdued',
      },
      error: {
        bg: 'red.background-primary',
        borderColor: 'red.border',
        color: 'red.action-primary-default',
      },
      info: {
        bg: 'blue.background-primary',
        borderColor: 'blue.border',
        color: 'blue.action-primary-default',
      },
      pending: {
        bg: 'orange.background-primary',
        borderColor: 'transparent',
        color: 'orange.text-primary',
        '& [data-dot]': { bg: 'orange.action-primary-default' },
      },
      success: {
        bg: 'green.background-primary',
        borderColor: 'green.border',
        color: 'green.action-primary-default',
      },
      warning: {
        bg: 'yellow.background-primary',
        borderColor: 'yellow.border',
        color: 'yellow.action-primary-default',
      },
    },
  },
});

type BadgeSize = 'md' | 'sm';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  // Optional leading icon, shown in place of the status dot (e.g. a key for a
  // "Creator" chip). Render it at 16px to sit right in the 32px pill.
  icon?: ReactNode;
}

export function Badge({ label, variant = 'default', size = 'md', icon }: BadgeProps) {
  const showDot = variant !== 'default' && !icon;
  return (
    <styled.span className={badge({ variant, size })}>
      {icon ? (
        <styled.span aria-hidden display="inline-flex" flexShrink={0}>
          {icon}
        </styled.span>
      ) : null}
      {showDot && (
        <styled.span
          aria-hidden
          data-dot
          width={size === 'sm' ? '6px' : '8px'}
          height={size === 'sm' ? '6px' : '8px'}
          flexShrink={0}
          borderRadius="round"
          bg="currentColor"
        />
      )}
      <styled.span>{label}</styled.span>
    </styled.span>
  );
}
