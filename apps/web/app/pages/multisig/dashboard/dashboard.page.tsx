import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useSession } from '~/features/multisig/auth/use-session';
import { useSignIn } from '~/features/multisig/auth/use-sign-in';
import {
  type DashboardActivityItem,
  useDashboardActivity,
} from '~/features/multisig/vaults/use-dashboard-activity';
import { useVaults } from '~/features/multisig/vaults/use-vaults';
import { Page } from '~/layouts/page/page';

import type { VaultSummary } from '@leather.io/models';
import { Button } from '@leather.io/ui';

import { ChainAvatar } from '../components/chain-avatar';
import { InvitationModal } from '../components/invitation-modal';
import { TransactionRow } from '../components/transaction-row';
import type { Chain } from '../data/multisig-types';
import { multisigPaths } from '../multisig.constants';
import { CreateVaultTile } from './components/create-vault-tile';
import { VaultCard } from './components/vault-card';

function SectionLabel({ children }: { children: string }) {
  return (
    <styled.h3 textStyle="label.01" color="ink.text-primary" mb="space.03">
      {children}
    </styled.h3>
  );
}

function EmptyVaults({ onCreate }: { onCreate(): void }) {
  return (
    <Flex
      direction="column"
      alignItems="center"
      textAlign="center"
      gap="space.03"
      py="space.08"
      px="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="ink.border-default"
    >
      <styled.img src="/multisig/illustrations/no-funds.png" alt="" width="72px" height="72px" />
      <styled.h4 textStyle="label.01">No vaults yet</styled.h4>
      <styled.p textStyle="body.02" color="ink.text-subdued" maxWidth="320px">
        Vaults are chain-specific. Create one to get started, or accept an invite to join an
        existing one.
      </styled.p>
      <Button variant="solid" onClick={onCreate}>
        Create vault
      </Button>
    </Flex>
  );
}

function EmptyActivity() {
  return (
    <Flex direction="column" alignItems="center" textAlign="center" gap="space.02" py="space.07">
      <styled.img
        src="/multisig/illustrations/no-activity.png"
        alt=""
        width="56px"
        height="56px"
        style={{ opacity: 0.9 }}
      />
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        No activity yet.
      </styled.span>
    </Flex>
  );
}

function ActivityFeed({
  activity,
  isLoading,
  onOpen,
}: {
  activity: DashboardActivityItem[];
  isLoading: boolean;
  onOpen(vaultId: string, txId: string): void;
}) {
  if (isLoading) {
    return (
      <Flex direction="column" gap="space.02" p="space.02">
        {[0, 1].map(index => (
          <Box
            key={index}
            height="56px"
            borderRadius="md"
            bg="ink.component-background-default"
            opacity={0.6}
          />
        ))}
      </Flex>
    );
  }
  if (activity.length === 0) return <EmptyActivity />;
  return (
    <>
      {activity.map(item => (
        <styled.button
          key={item.transaction.id}
          type="button"
          onClick={() => onOpen(item.vaultId, item.transaction.id)}
          display="block"
          width="100%"
          textAlign="left"
          cursor="pointer"
          bg="transparent"
          p="space.03"
          borderRadius="md"
          _hover={{ bg: 'ink.component-background-hover' }}
        >
          <TransactionRow transaction={item.transaction} subtitle={item.vaultName} />
        </styled.button>
      ))}
    </>
  );
}

function ConnectChainPrompt({
  chain,
  onConnect,
  isPending,
}: {
  chain: Chain;
  onConnect(): void;
  isPending: boolean;
}) {
  const label = chain === 'btc' ? 'Bitcoin' : 'Stacks';
  return (
    <Flex
      mt="space.05"
      gap="space.04"
      alignItems="center"
      p="space.04"
      borderRadius="md"
      bg="ink.background-secondary"
    >
      <ChainAvatar chain={chain} boxSize="40px" />
      <Box flex={1} minWidth={0}>
        <styled.p textStyle="label.01">Connect {label} to see more vaults</styled.p>
        <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.01">
          You'll be able to create and join {label} multisig vaults alongside your existing ones.
        </styled.p>
      </Box>
      <Button variant="outline" disabled={isPending} aria-busy={isPending} onClick={onConnect}>
        Connect {label}
      </Button>
    </Flex>
  );
}

export function MultisigDashboardPage() {
  const navigate = useNavigate();
  const [inviteVault, setInviteVault] = useState<VaultSummary | null>(null);
  const btcVaults = useVaults('btc:mainnet');
  const stxVaults = useVaults('stx:mainnet');
  const btcSession = useSession('btc:mainnet');
  const stxSession = useSession('stx:mainnet');
  const btcSignIn = useSignIn('btc:mainnet');
  const stxSignIn = useSignIn('stx:mainnet');

  const vaults = [...(btcVaults.data ?? []), ...(stxVaults.data ?? [])];
  const { activity, isLoading: isLoadingActivity } = useDashboardActivity(vaults);

  const [searchParams, setSearchParams] = useSearchParams();
  const inviteParam = searchParams.get('invite');
  useEffect(() => {
    if (!inviteParam) return;
    const match = [...(btcVaults.data ?? []), ...(stxVaults.data ?? [])].find(
      summary => summary.id === inviteParam
    );
    if (!match) return;
    setInviteVault(match);
    setSearchParams(
      params => {
        params.delete('invite');
        return params;
      },
      { replace: true }
    );
  }, [inviteParam, btcVaults.data, stxVaults.data, setSearchParams]);

  const isLoadingVaults = btcVaults.isLoading || stxVaults.isLoading;
  const hasFetchedVaults = btcVaults.isFetched || stxVaults.isFetched;
  const isResolvingVaults = isLoadingVaults || !hasFetchedVaults;

  // Invited vaults float to the top so pending invitations are seen first.
  const sortedVaults = vaults
    .slice()
    .sort(
      (a, b) =>
        (b.membershipStatus === 'invited' ? 1 : 0) - (a.membershipStatus === 'invited' ? 1 : 0)
    );

  return (
    <Page>
      <Page.Header title="Multisig" />
      <Flex
        direction={['column', 'column', 'row']}
        gap="space.06"
        alignItems="flex-start"
        mt="space.07"
      >
        <Box flex={['1', '1', '1.6']} width="100%">
          <SectionLabel>My vaults</SectionLabel>
          <Flex direction="column" gap="space.03">
            {isResolvingVaults &&
              sortedVaults.length === 0 &&
              [0, 1, 2].map(index => (
                <Box
                  key={index}
                  height="72px"
                  borderRadius="md"
                  bg="ink.component-background-default"
                  opacity={0.6}
                />
              ))}
            {!isResolvingVaults && sortedVaults.length === 0 && (
              <EmptyVaults onCreate={() => navigate(multisigPaths.createVault)} />
            )}
            {sortedVaults.map(vault => (
              <VaultCard
                key={vault.id}
                vault={vault}
                onClick={() =>
                  vault.membershipStatus === 'invited'
                    ? setInviteVault(vault)
                    : navigate(multisigPaths.vault(vault.id))
                }
              />
            ))}
            {sortedVaults.length > 0 && (
              <CreateVaultTile onClick={() => navigate(multisigPaths.createVault)} />
            )}
          </Flex>
          {!btcSession && (
            <ConnectChainPrompt
              chain="btc"
              onConnect={() => btcSignIn.mutate()}
              isPending={btcSignIn.isPending}
            />
          )}
          {!stxSession && (
            <ConnectChainPrompt
              chain="stx"
              onConnect={() => stxSignIn.mutate()}
              isPending={stxSignIn.isPending}
            />
          )}
        </Box>
        <Box flex={['1', '1', '1']} width="100%">
          <SectionLabel>Activity</SectionLabel>
          <Box
            borderRadius="md"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="ink.border-default"
            p="space.02"
          >
            <ActivityFeed
              activity={activity}
              isLoading={isLoadingActivity}
              onOpen={(targetVaultId, txId) => void navigate(multisigPaths.tx(targetVaultId, txId))}
            />
          </Box>
        </Box>
      </Flex>

      {inviteVault && (
        <InvitationModal vault={inviteVault} isShowing onClose={() => setInviteVault(null)} />
      )}
    </Page>
  );
}

export function MultisigDashboardSkeleton() {
  return (
    <Page>
      <Page.Header title="Multisig" />
      <Flex direction={['column', 'column', 'row']} gap="space.06" mt="space.07">
        <Box flex={['1', '1', '1.6']} width="100%">
          <Flex direction="column" gap="space.03">
            {[0, 1, 2].map(i => (
              <Box
                key={i}
                height="72px"
                borderRadius="md"
                bg="ink.component-background-default"
                opacity={0.6}
              />
            ))}
          </Flex>
        </Box>
        <Box flex={['1', '1', '1']} width="100%">
          <Box
            height="200px"
            borderRadius="md"
            bg="ink.component-background-default"
            opacity={0.6}
          />
        </Box>
      </Flex>
    </Page>
  );
}
