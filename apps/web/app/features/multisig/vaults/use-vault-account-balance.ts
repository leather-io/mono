import type { Money } from '@leather.io/models';

interface VaultAccountBalance {
  crypto?: Money;
  fiat?: Money;
}

// Vault account balances are intentionally not wired yet (placeholder).
//
// They will be read through @leather.io/services (StxBalancesService /
// BtcBalancesService, which return crypto + quote/fiat together) once the
// services layer accepts a multisig AccountRequest. The Stacks side only needs
// the multisig address; the Bitcoin side needs new address-based UTXO /
// transaction endpoints, since the services currently request data by xpub
// descriptor. Backend work for this is in progress.
//
// Until then these return no balance, so the Balance component renders its "—"
// placeholder, and we avoid shipping deprecated @leather.io/query usage (or a
// throwaway direct-mempool fetch) on this branch. The migration will add the
// network/address parameters these hooks need.
export function useVaultAccountBalance(): VaultAccountBalance {
  return {};
}

export function useVaultAccountsBalance(): VaultAccountBalance {
  return {};
}
