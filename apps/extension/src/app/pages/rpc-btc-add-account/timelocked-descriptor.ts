import type { HDKey } from '@scure/bip32';

import {
  type CompiledWshDescriptor,
  findAccountDescriptorKey,
  matchBondTemplateDescriptor,
} from '@leather.io/bitcoin';

import type { BondSpendingDetails } from '@app/components/bond-spending-conditions';

export function matchTimelockedDescriptor(descriptor: string): BondSpendingDetails | null {
  const match = matchBondTemplateDescriptor(descriptor);
  if (!match) return null;
  return {
    unlockHeight: match.unlockHeight,
    hash: match.hash,
    counterpartyKey: match.counterpartyKey,
    vaultKind: match.vault.kind,
    vaultThreshold: match.vault.threshold,
    vaultKeyExpressions: match.vault.keyExpressions,
  };
}

export function findTimelockedVaultAccountKey(
  compiled: CompiledWshDescriptor,
  timelock: BondSpendingDetails,
  accountKeychain: HDKey
) {
  const vaultKeys = compiled.keys.filter(key =>
    timelock.vaultKeyExpressions.includes(key.keyExpression)
  );
  return findAccountDescriptorKey({ ...compiled, keys: vaultKeys }, accountKeychain);
}
