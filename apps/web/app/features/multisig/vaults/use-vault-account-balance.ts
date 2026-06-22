import type { Money } from '@leather.io/models';

interface VaultAccountBalance {
  crypto?: Money;
  fiat?: Money;
}

// Placeholder until vault balances are wired through @leather.io/services (see PR for detail).
export function useVaultAccountBalance(): VaultAccountBalance {
  return {};
}

export function useVaultAccountsBalance(): VaultAccountBalance {
  return {};
}
