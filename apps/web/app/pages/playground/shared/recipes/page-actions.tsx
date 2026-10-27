import type { ReactNode } from 'react';

import { Grid } from 'leather-styles/jsx';

import { Button, type ButtonProps } from '@leather.io/ui';

interface PageActionContent {
  label: string;
  disabled?: boolean;
  pending?: boolean;
  iconStart?: ButtonProps['iconStart'];
  form?: ButtonProps['form'];
}

type PageAction = PageActionContent &
  (
    | { type?: 'button'; onClick: NonNullable<ButtonProps['onClick']> }
    | { type: 'submit'; onClick?: ButtonProps['onClick'] }
  );

export interface PageActionsProps {
  primary: PageAction & { intent?: 'default' | 'danger' };
  secondary?: PageAction;
  mode?: 'task' | 'management';
}

export type PageFooterContentProps =
  | { actions?: PageActionsProps; customFooter?: never }
  | { actions?: never; customFooter?: ReactNode };

interface ActionButtonProps {
  action: PageAction;
  variant: 'solid' | 'outline';
  intent?: 'default' | 'danger';
  pending: boolean;
}

function ActionButton({ action, variant, intent, pending }: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      intent={intent}
      fullWidth
      minWidth={0}
      minHeight="48px"
      height="auto"
      py="space.03"
      whiteSpace="normal"
      overflowWrap="anywhere"
      aria-label={action.label}
      aria-busy={action.pending || undefined}
      disabled={pending || action.disabled}
      iconStart={action.iconStart}
      type={action.type}
      form={action.form}
      onClick={action.onClick}
      css={{ '& > svg': { flexShrink: 0 } }}
    >
      {action.label}
    </Button>
  );
}

export function PageActions({ primary, secondary, mode = 'task' }: PageActionsProps) {
  const pending = Boolean(primary.pending || secondary?.pending);
  return (
    <Grid
      width="100%"
      minWidth={0}
      gridTemplateColumns={secondary ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)'}
      gap="space.04"
    >
      {secondary ? <ActionButton action={secondary} variant="outline" pending={pending} /> : null}
      <ActionButton
        action={primary}
        variant={mode === 'management' ? 'outline' : 'solid'}
        intent={primary.intent}
        pending={pending}
      />
    </Grid>
  );
}
