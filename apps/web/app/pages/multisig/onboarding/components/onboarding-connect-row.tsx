import { Box, Flex, styled } from 'leather-styles/jsx';

import type { AuthSession } from '@leather.io/models';
import { Button } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { Badge } from '../../components/badge';
import { ChainAvatar } from '../../components/chain-avatar';
import { VaultListItem } from '../../components/vault-list-item';
import type { Chain } from '../../data/multisig-types';

interface OnboardingConnectRowProps {
  chain: Chain;
  session: AuthSession | null;
  isPending: boolean;
  isRestoring: boolean;
  error: Error | null;
  onSignIn(): void;
  onSignOut(): void;
}

export function OnboardingConnectRow({
  chain,
  session,
  isPending,
  isRestoring,
  error,
  onSignIn,
  onSignOut,
}: OnboardingConnectRowProps) {
  const label = chain === 'btc' ? 'Bitcoin' : 'Stacks';
  const desc = chain === 'btc' ? 'Sign PSBT-based BTC vaults' : 'Sign on-chain STX & sBTC vaults';
  return (
    <Box
      p="space.04"
      borderRadius="lg"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
    >
      <VaultListItem
        leading={<ChainAvatar chain={chain} size="lg" />}
        title={session ? `Connected to ${label}` : `Connect ${label}`}
        caption={session ? truncateMiddle(session.identity.address, 4) : desc}
        trailingTitle={
          session ? (
            <Flex alignItems="center" gap="space.03">
              {isRestoring ? (
                <Badge variant="default" label="Restoring…" />
              ) : (
                <Badge variant="success" label="Signed in" />
              )}
              <Button variant="ghost" onClick={onSignOut}>
                Sign out
              </Button>
            </Flex>
          ) : (
            <Button variant="solid" minWidth="124px" disabled={isPending} onClick={onSignIn}>
              {isPending ? 'Connecting…' : 'Connect'}
            </Button>
          )
        }
      />
      {error?.message?.trim() && (
        <styled.div textStyle="caption.01" color="red.action-primary-default" mt="space.03">
          {error.message}
        </styled.div>
      )}
    </Box>
  );
}
