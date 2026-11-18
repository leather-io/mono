import { css } from 'leather-styles/css';

type ApprovalSurfaceRole = 'group' | 'inset' | 'notice' | 'outline' | 'interactive';

export const approvalSurface: Record<ApprovalSurfaceRole, string> = {
  group: css({
    bg: 'ink.background-secondary',
    borderRadius: 'md',
    '[data-approval-containers=interactive] &': {
      bg: 'ink.background-primary',
      borderWidth: 1,
      borderColor: 'ink.border-default',
    },
  }),
  inset: css({
    bg: 'ink.background-secondary',
    borderRadius: 'md',
    '[data-approval-containers=interactive] &': {
      bg: 'ink.background-primary',
      borderWidth: 1,
      borderColor: 'ink.border-default',
    },
  }),
  notice: css({ bg: 'yellow.background-primary', borderRadius: 'md' }),
  outline: css({ borderWidth: 1, borderColor: 'ink.border-default', borderRadius: 'md' }),
  interactive: css({
    bg: 'ink.background-secondary',
    borderRadius: 'md',
    '[data-approval-containers=interactive] &': {
      bg: 'ink.component-background-default',
      '&:hover': {
        backgroundImage:
          'linear-gradient(token(colors.ink.component-background-hover), token(colors.ink.component-background-hover))',
      },
    },
  }),
};

export const approvalGroupFill = css({
  bg: 'ink.background-secondary',
  '[data-approval-containers=interactive] &': {
    bg: 'ink.background-primary',
    borderWidth: 1,
    borderColor: 'ink.border-default',
  },
});

export const approvalInteractiveFill = css({
  bg: 'ink.background-secondary',
  '[data-approval-containers=interactive] &': { bg: 'ink.component-background-default' },
});

export const approvalInteractiveRow = css({
  '[data-approval-containers=interactive] &': {
    mx: '0',
    px: 'space.03',
    borderRadius: 'md',
    bg: 'ink.component-background-default',
    cursor: 'pointer',
    '&:hover': {
      backgroundImage:
        'linear-gradient(token(colors.ink.component-background-hover), token(colors.ink.component-background-hover))',
    },
    '&:active': {
      backgroundImage:
        'linear-gradient(token(colors.ink.component-background-pressed), token(colors.ink.component-background-pressed))',
    },
  },
});

export const approvalInteractiveTrigger = css({
  '[data-approval-containers=interactive] &': {
    px: 'space.03',
    py: 'space.02',
    minHeight: '40px',
    borderRadius: 'md',
    bg: 'ink.component-background-default',
    '&[aria-expanded=true]': { mb: 'space.02' },
    '&:hover': {
      backgroundImage:
        'linear-gradient(token(colors.ink.component-background-hover), token(colors.ink.component-background-hover))',
    },
  },
});

export const approvalSegmentedGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  borderRadius: 'md',
  overflow: 'hidden',
});

export const approvalDivider = css({
  borderTopWidth: 1,
  borderColor: 'ink.border-default',
  '[data-approval-containers=interactive] &': { borderTopWidth: 0 },
});

export const approvalDimmedDigits = css({
  color:
    'color-mix(in srgb, token(colors.ink.text-primary) 62%, token(colors.ink.background-primary))',
});

export const approvalIconTile = css({
  bg: 'ink.component-background-default',
  '[data-approval-containers=interactive] &': {
    bg: 'ink.background-primary',
    outlineColor: 'ink.border-default',
  },
});
