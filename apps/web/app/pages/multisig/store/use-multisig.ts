import { useContext, useMemo } from 'react';

import type { Chain, MultisigTransaction, NewMemberInput, Vault } from '../data/multisig-types';
import { MultisigSessionContext } from './multisig-session';

function useSession() {
  const ctx = useContext(MultisigSessionContext);
  // Missing provider is a wiring error (invalid state), not an expected empty
  // state — surfacing it loudly is correct.
  if (!ctx) throw new Error('useMultisig hooks must be used within <MultisigSessionProvider>');
  return ctx;
}

function useVaults(): Vault[] {
  return useSession().state.vaults;
}

function useVault(vaultId: string | undefined): Vault | undefined {
  const { state } = useSession();
  return state.vaults.find(vault => vault.id === vaultId);
}

export function useVaultTx(
  vaultId: string | undefined,
  txId: string | undefined
): { vault: Vault | undefined; tx: MultisigTransaction | undefined } {
  const vault = useVault(vaultId);
  const tx = vault?.transactions.find(t => t.id === txId);
  return { vault, tx };
}

interface RecentTransaction extends MultisigTransaction {
  vault: Vault;
}

export function useRecentTransactions(limit = 5): RecentTransaction[] {
  const vaults = useVaults();
  const out: RecentTransaction[] = [];
  for (const vault of vaults) {
    if (vault.invited) continue;
    for (const tx of vault.transactions) out.push({ ...tx, vault });
  }
  return out
    .slice()
    .sort((a, b) => (b.highlight ? 1 : 0) - (a.highlight ? 1 : 0))
    .slice(0, limit);
}

interface MultisigActions {
  addVault(payload: { chain: Chain; name: string; theme: number; members: NewMemberInput[] }): void;
  addAccount(payload: { vaultId: string; name: string; threshold: number; icon: string }): void;
  acceptInvite(vaultId: string): void;
  declineInvite(vaultId: string): void;
  proposeTransaction(payload: {
    vaultId: string;
    accountId: string;
    recipient: string;
    amount: string;
  }): void;
  signTransaction(payload: { vaultId: string; txId: string; signer: string }): void;
  broadcastTransaction(vaultId: string, txId: string): void;
  cancelTransaction(vaultId: string, txId: string): void;
  cancelVault(vaultId: string): void;
  resetSession(mode: 'empty' | 'seed'): void;
}

export function useMultisigActions(): MultisigActions {
  const { dispatch } = useSession();
  return useMemo(
    () => ({
      addVault(payload) {
        dispatch({ type: 'addVault', payload });
      },
      addAccount(payload) {
        dispatch({ type: 'addAccount', payload });
      },
      acceptInvite(vaultId) {
        dispatch({ type: 'acceptInvite', payload: { vaultId } });
      },
      declineInvite(vaultId) {
        dispatch({ type: 'declineInvite', payload: { vaultId } });
      },
      proposeTransaction(payload) {
        dispatch({ type: 'proposeTransaction', payload });
      },
      signTransaction(payload) {
        dispatch({ type: 'signTransaction', payload });
      },
      broadcastTransaction(vaultId, txId) {
        dispatch({ type: 'broadcastTransaction', payload: { vaultId, txId } });
      },
      cancelTransaction(vaultId, txId) {
        dispatch({ type: 'cancelTransaction', payload: { vaultId, txId } });
      },
      cancelVault(vaultId) {
        dispatch({ type: 'cancelVault', payload: { vaultId } });
      },
      resetSession(mode) {
        dispatch({ type: 'reset', payload: mode });
      },
    }),
    [dispatch]
  );
}
