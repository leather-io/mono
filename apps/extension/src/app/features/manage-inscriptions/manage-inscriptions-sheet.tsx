import { Box, Stack, styled } from 'leather-styles/jsx';

import { Button, LockIcon, Sheet, SheetHeader, UnlockIcon } from '@leather.io/ui';

import { useCurrentAccountDiscardedInscriptions } from '@app/store/settings/settings.selectors';

interface ProtectionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  testId?: string;
  onAction(): void;
}

function ProtectionCard({
  icon,
  title,
  description,
  actionLabel,
  testId,
  onAction,
}: ProtectionCardProps) {
  return (
    <Box border="default" borderRadius="sm" p="space.05">
      <Stack gap="space.04">
        <Stack gap="space.02">
          {icon}
          <styled.span textStyle="label.02">{title}</styled.span>
          <styled.p textStyle="caption.01" color="ink.text-primary" margin="0">
            {description}
          </styled.p>
        </Stack>
        <Box>
          <Button variant="outline" size="sm" onClick={onAction} data-testid={testId}>
            {actionLabel}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

interface ManageInscriptionsSheetProps {
  isShowing: boolean;
  onClose(): void;
}

export function ManageInscriptionsSheet({ isShowing, onClose }: ManageInscriptionsSheetProps) {
  const { inscriptions, discardInscriptions, recoverInscriptions } =
    useCurrentAccountDiscardedInscriptions();

  function handleResetProtection() {
    recoverInscriptions(inscriptions ?? []);
  }

  function handleAllowSpending() {
    discardInscriptions(inscriptions ?? []);
  }

  return (
    <Sheet
      header={<SheetHeader title="Manage collectibles" />}
      isShowing={isShowing}
      onClose={onClose}
    >
      <Stack gap="space.05" px="space.05" pb="space.05" data-testid="manage-inscriptions-sheet">
        <ProtectionCard
          icon={<LockIcon />}
          title="Protect inscriptions"
          description="Your inscriptions are kept safe by default. They're locked so you don't accidentally spend them when sending Bitcoin."
          actionLabel="Reset protection"
          testId="reset-protection-btn"
          onAction={handleResetProtection}
        />
        <ProtectionCard
          icon={<UnlockIcon />}
          title="Unprotect them in bulk"
          description="Making all inscriptions spendable lets them be used in transactions but use with caution, as they may be lost."
          actionLabel="Allow spending all inscriptions"
          testId="allow-spending-btn"
          onAction={handleAllowSpending}
        />
      </Stack>
    </Sheet>
  );
}
