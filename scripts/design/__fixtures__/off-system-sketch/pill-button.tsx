// Fixture: a local "PillButton" that is basically Button with a pill radius.
import type { ReactNode } from 'react';

import { css } from 'leather-styles/css';

interface PillButtonProps {
  children: ReactNode;
  onClick?(): void;
  disabled?: boolean;
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'lg';
  loading?: boolean;
  compact?: boolean;
}

export function PillButton({
  children,
  onClick,
  disabled,
  variant = 'solid',
  loading,
  compact,
}: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={css({
        borderRadius: '9999px',
        height: compact ? '36px' : '48px',
        px: '16px',
        textStyle: 'label.02',
        bg: variant === 'solid' ? 'ink.action-primary-default' : 'transparent',
        color: variant === 'solid' ? 'ink.background-primary' : 'ink.action-primary-default',
      })}
    >
      {children}
    </button>
  );
}
