import { matchBondTemplateDescriptor } from '@leather.io/bitcoin';

import type { BondSpendingDetails } from '@app/components/bond-spending-conditions';

export function matchTimelockedDescriptor(descriptor: string): BondSpendingDetails | null {
  const match = matchBondTemplateDescriptor(descriptor);
  if (!match) return null;
  return {
    unlockHeight: match.unlockHeight,
    hash: match.hash,
    counterpartyKey: match.counterpartyKey,
    vaultKind: match.vault.kind,
    vaultThreshold: match.vault.requiredSignatures,
    vaultKeyExpressions: match.vault.keys,
  };
}
