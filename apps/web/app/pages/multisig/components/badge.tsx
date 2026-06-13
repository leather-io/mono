import { cva } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';

export type BadgeVariant = 'default' | 'error' | 'info' | 'pending' | 'success' | 'warning';

const badge = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    width: 'fit-content',
    height: '16px',
    gap: 'space.01',
    pl: 'space.01',
    pr: 'space.02',
    borderRadius: 'round',
    borderWidth: '1px',
    borderStyle: 'solid',
    textStyle: 'label.03',
    fontSize: '11px',
  },
  variants: {
    variant: {
      default: {
        pl: 'space.02',
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
        borderColor: 'orange.background-primary',
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

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const showDot = variant !== 'default';
  return (
    <styled.span className={badge({ variant })}>
      {showDot && (
        <styled.span
          aria-hidden
          data-dot
          width="6px"
          height="6px"
          flexShrink={0}
          borderRadius="round"
          bg="currentColor"
        />
      )}
      <styled.span position="relative" top="1px">
        {label}
      </styled.span>
    </styled.span>
  );
}
