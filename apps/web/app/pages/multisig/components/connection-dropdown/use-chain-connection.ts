import { useSession } from '~/features/multisig/auth/use-session';
import { useIsRestoringSession } from '~/features/multisig/auth/use-session-bootstrap';
import { useSignIn } from '~/features/multisig/auth/use-sign-in';
import { useSignOut } from '~/features/multisig/auth/use-sign-out';

import type { AuthNetworkId } from '@leather.io/models';

import type { Chain } from '../../data/multisig-types';

const chainLabels: Record<Chain, string> = {
  btc: 'Bitcoin',
  stx: 'Stacks',
};

const chainSignInDescriptions: Record<Chain, string> = {
  btc: 'BTC native-segwit (P2WPKH) vaults',
  stx: 'STX & sBTC vaults · Stacks signers',
};

// V1 is mainnet-pinned (spec §2.2); the wallet inherits the web app's network.
export const multisigV1Networks: Record<Chain, AuthNetworkId> = {
  btc: 'btc:mainnet',
  stx: 'stx:mainnet',
};

export function useChainConnection(chain: Chain, network: AuthNetworkId) {
  const session = useSession(network);
  const signIn = useSignIn(network);
  const signOut = useSignOut(network);
  const isRestoring = useIsRestoringSession(network);
  return {
    chain,
    label: chainLabels[chain],
    description: chainSignInDescriptions[chain],
    session,
    signIn,
    signOut,
    isRestoring,
  };
}

export type ChainConnection = ReturnType<typeof useChainConnection>;
