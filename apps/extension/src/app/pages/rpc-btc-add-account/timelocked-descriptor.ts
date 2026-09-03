import { matchBondTemplateDescriptor } from '@leather.io/bitcoin';

interface TimelockedDescriptor {
  unlockHeight: number;
  vaultThreshold: number;
  vaultKeyCount: number;
}

export function matchTimelockedDescriptor(descriptor: string): TimelockedDescriptor | null {
  const match = matchBondTemplateDescriptor(descriptor);
  if (!match) return null;
  return {
    unlockHeight: match.unlockHeight,
    vaultThreshold: match.vault.threshold,
    vaultKeyCount: match.vault.keyExpressions.length,
  };
}
