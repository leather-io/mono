import { type ReactNode, createContext, useReducer } from 'react';

import { createSeedVaults } from '../data/dummy-multisig-data';
import type {
  Chain,
  Member,
  MultisigAccount,
  MultisigTransaction,
  NewMemberInput,
  Vault,
} from '../data/multisig-types';

export interface MultisigSessionState {
  vaults: Vault[];
  // Monotonic counter for generated ids — keeps id creation deterministic and
  // SSR-safe (no Date.now()/random).
  idSeq: number;
}

type MultisigAction =
  | { type: 'reset'; payload: 'empty' | 'seed' }
  | {
      type: 'addVault';
      payload: { chain: Chain; name: string; theme: number; members: NewMemberInput[] };
    }
  | {
      type: 'addAccount';
      payload: { vaultId: string; name: string; threshold: number; icon: string };
    }
  | { type: 'acceptInvite'; payload: { vaultId: string } }
  | { type: 'declineInvite'; payload: { vaultId: string } }
  | {
      type: 'proposeTransaction';
      payload: { vaultId: string; accountId: string; recipient: string; amount: string };
    }
  | { type: 'signTransaction'; payload: { vaultId: string; txId: string; signer: string } }
  | { type: 'broadcastTransaction'; payload: { vaultId: string; txId: string } }
  | { type: 'cancelTransaction'; payload: { vaultId: string; txId: string } }
  | { type: 'cancelVault'; payload: { vaultId: string } };

const SEED_ID_START = 1000;

export function createInitialState(): MultisigSessionState {
  return { vaults: createSeedVaults(), idSeq: SEED_ID_START };
}

function updateVault(vaults: Vault[], vaultId: string, fn: (vault: Vault) => Vault): Vault[] {
  return vaults.map(vault => (vault.id === vaultId ? fn(vault) : vault));
}

function updateTx(
  vault: Vault,
  txId: string,
  fn: (tx: MultisigTransaction) => MultisigTransaction
): Vault {
  return { ...vault, transactions: vault.transactions.map(tx => (tx.id === txId ? fn(tx) : tx)) };
}

function newMembersFromInput(inputs: NewMemberInput[]): Member[] {
  return inputs.map(input => {
    if (input.isMe) {
      return {
        name: input.name || 'Me',
        handle: 'carey.btc',
        addr: input.addr,
        role: 'Admin',
        isCreator: true,
        inviteStatus: 'joined',
        joinedAt: 'Just now',
      };
    }
    return {
      name: input.name || input.addr,
      handle: '',
      addr: input.addr,
      role: 'Member',
      isCreator: false,
      inviteStatus: 'invited',
      joinedAt: null,
    };
  });
}

function placeholderVaultAddress(chain: Chain, seq: number): string {
  return chain === 'btc'
    ? `bc1qvault${seq}p7w2x8r4tnvyu0d5h6f0jgk8m4cqfltm9phf8x2axqs4vym3p`
    : `SM${seq}D8K9J3XYE7WQ4N5H6VBRFC0TPGA1MKS3JBNVY`;
}

export function multisigReducer(
  state: MultisigSessionState,
  action: MultisigAction
): MultisigSessionState {
  switch (action.type) {
    case 'reset': {
      return action.payload === 'empty'
        ? { vaults: [], idSeq: state.idSeq }
        : { vaults: createSeedVaults(), idSeq: state.idSeq };
    }

    case 'addVault': {
      const { chain, name, theme, members } = action.payload;
      const vault: Vault = {
        id: `vault-${state.idSeq}`,
        name,
        chain,
        theme,
        // Fresh vault: creator joined, other members invited, awaiting
        // acceptance — so the share-invites and cancel affordances are demoable.
        status: 'pending',
        balanceUsd: 0,
        balanceSub: chain === 'btc' ? '0 BTC' : '0 STX',
        members: newMembersFromInput(members),
        inviter: 'carey.btc',
        inviteToken: `v1-${state.idSeq}`,
        createdAt: 'Just now',
        invited: false,
        accounts: [],
        transactions: [],
      };
      return { vaults: [vault, ...state.vaults], idSeq: state.idSeq + 1 };
    }

    case 'addAccount': {
      const { vaultId, name, threshold, icon } = action.payload;
      const vaults = updateVault(state.vaults, vaultId, vault => {
        const account: MultisigAccount = {
          id: `acct-${state.idSeq}`,
          name,
          icon,
          addr: placeholderVaultAddress(vault.chain, state.idSeq),
          balanceUsd: 0,
          balanceSub: vault.chain === 'btc' ? '0 BTC' : '0 STX',
          threshold: [threshold, vault.members.length],
          proposers: [],
        };
        return { ...vault, accounts: [...vault.accounts, account] };
      });
      return { vaults, idSeq: state.idSeq + 1 };
    }

    case 'acceptInvite': {
      const vaults = updateVault(state.vaults, action.payload.vaultId, vault => ({
        ...vault,
        invited: false,
        status: 'active',
      }));
      return { ...state, vaults };
    }

    case 'declineInvite': {
      return {
        ...state,
        vaults: state.vaults.filter(vault => vault.id !== action.payload.vaultId),
      };
    }

    case 'proposeTransaction': {
      const { vaultId, accountId, recipient, amount } = action.payload;
      const vaults = updateVault(state.vaults, vaultId, vault => {
        const account = vault.accounts.find(a => a.id === accountId);
        const symbol = vault.chain === 'btc' ? 'BTC' : 'STX';
        const tx: MultisigTransaction = {
          id: `tx-${state.idSeq}`,
          kind: 'send',
          title: `Send ${symbol}`,
          sub: `To ${recipient}`,
          status: 'pending',
          amount: `-${amount} ${symbol}`,
          amountUsd: '—',
          time: 'Just now',
          highlight: true,
          accountId,
          proposerName: 'Me',
          proposerUserId: 'me',
          proposedAt: 'Just now',
          signed: ['Me'],
          required: account ? account.threshold[0] : 2,
        };
        return { ...vault, transactions: [tx, ...vault.transactions] };
      });
      return { vaults, idSeq: state.idSeq + 1 };
    }

    case 'signTransaction': {
      const { vaultId, txId, signer } = action.payload;
      const vaults = updateVault(state.vaults, vaultId, vault =>
        updateTx(vault, txId, tx => {
          const signed = tx.signed.includes(signer) ? tx.signed : [...tx.signed, signer];
          const status = signed.length >= tx.required ? 'signed' : tx.status;
          return { ...tx, signed, status };
        })
      );
      return { ...state, vaults };
    }

    case 'broadcastTransaction': {
      const { vaultId, txId } = action.payload;
      const vaults = updateVault(state.vaults, vaultId, vault =>
        updateTx(vault, txId, tx => ({ ...tx, status: 'broadcast' }))
      );
      return { ...state, vaults };
    }

    case 'cancelTransaction': {
      const { vaultId, txId } = action.payload;
      const vaults = updateVault(state.vaults, vaultId, vault =>
        updateTx(vault, txId, tx => ({ ...tx, status: 'cancelled' }))
      );
      return { ...state, vaults };
    }

    case 'cancelVault': {
      // Only a pending (not-yet-active) vault can be cancelled — matches the
      // prototype; a no-op for active/cancelled vaults.
      const vaults = updateVault(state.vaults, action.payload.vaultId, vault =>
        vault.status === 'pending' ? { ...vault, status: 'cancelled' } : vault
      );
      return { ...state, vaults };
    }

    default:
      return state;
  }
}

interface MultisigSessionContextValue {
  state: MultisigSessionState;
  dispatch: React.Dispatch<MultisigAction>;
}

export const MultisigSessionContext = createContext<MultisigSessionContextValue | null>(null);

export function MultisigSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(multisigReducer, undefined, createInitialState);
  return (
    <MultisigSessionContext.Provider value={{ state, dispatch }}>
      {children}
    </MultisigSessionContext.Provider>
  );
}
