import { Flex, styled } from 'leather-styles/jsx';
import { ConnectActionRow } from '~/components/connect-card/connect-card';

import type { AuthSession } from '@leather.io/models';
import { Button } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { Badge } from '../../components/badge';
import { ChainAvatar } from '../../components/chain-avatar';
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

  const trailing = session ? (
    <Flex alignItems="center" gap="space.02">
      {isRestoring ? (
        <Badge variant="default" label="Restoring…" />
      ) : (
        <Badge variant="success" label="Signed in" />
      )}
      <Button variant="ghost" size="md" onClick={onSignOut}>
        Sign out
      </Button>
    </Flex>
  ) : (
    <Button
      width="100px"
      height="48px"
      variant="solid"
      disabled={isPending}
      aria-busy={isPending}
      onClick={onSignIn}
    >
      {isPending ? 'Connecting…' : 'Connect'}
    </Button>
  );

  return (
    <ConnectActionRow
      img={<ChainAvatar chain={chain} boxSize="48px" />}
      title={session ? `Connected to ${label}` : `Connect ${label}`}
      description={session ? truncateMiddle(session.identity.address, 4) : desc}
      trailing={trailing}
      error={
        error?.message?.trim() ? (
          <styled.div
            textStyle="caption.01"
            color="red.action-primary-default"
            mt="space.02"
            ml="space.04"
          >
            {error.message}
          </styled.div>
        ) : undefined
      }
    />
  );
}
