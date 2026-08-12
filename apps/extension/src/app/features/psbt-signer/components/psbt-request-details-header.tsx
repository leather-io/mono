import type { ReactNode } from 'react';

import { HStack, styled } from 'leather-styles/jsx';

import { type BadgeProps, ErrorTriangleIcon, LockIcon, UnlockIcon } from '@leather.io/ui';

import { usePsbtSignerContext } from '@app/features/psbt-signer/psbt-signer.context';
import { BadgeWithTooltip } from '@app/ui/components/badge/badge-with-tooltip';

const immutableLabel =
  'Any modification to the transaction, including the fee amount or other inputs/outputs, will invalidate the signature.';
const uncertainLabel =
  'The transaction details can be altered by other participants. This means the final outcome of the transaction might be different than initially agreed upon.';
const dangerousLabel =
  'This signature does not commit to the outputs shown. The recipient and amount are not guaranteed — the funds can be redirected after you sign.';

interface CertaintyBadge {
  hoverLabel: string;
  icon: ReactNode;
  label: string;
  variant: BadgeProps['variant'];
}

function getCertaintyBadge({
  hasDisallowedSighash,
  isPsbtMutable,
}: {
  hasDisallowedSighash: boolean;
  isPsbtMutable: boolean;
}): CertaintyBadge {
  if (hasDisallowedSighash)
    return {
      hoverLabel: dangerousLabel,
      icon: <ErrorTriangleIcon variant="small" />,
      label: 'Dangerous',
      variant: 'error',
    };
  if (isPsbtMutable)
    return {
      hoverLabel: uncertainLabel,
      icon: <UnlockIcon variant="small" />,
      label: 'Uncertain',
      variant: 'warning',
    };
  return {
    hoverLabel: immutableLabel,
    icon: <LockIcon variant="small" />,
    label: 'Certain',
    variant: 'default',
  };
}

export function PsbtRequestDetailsHeader() {
  const { hasDisallowedSighash, isPsbtMutable } = usePsbtSignerContext();
  const badge = getCertaintyBadge({ hasDisallowedSighash, isPsbtMutable });

  return (
    <HStack alignItems="center" gap="space.02">
      <styled.h2 textStyle="heading.05">Transaction</styled.h2>
      <BadgeWithTooltip
        hoverLabel={badge.hoverLabel}
        icon={badge.icon}
        label={badge.label}
        variant={badge.variant}
        outlined
      />
    </HStack>
  );
}
