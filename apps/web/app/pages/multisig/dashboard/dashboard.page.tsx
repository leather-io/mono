import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import type { VaultActivityItem } from '~/features/multisig/activity/harmonize-vault-activity';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { useSession } from '~/features/multisig/auth/use-session';
import { useSignIn } from '~/features/multisig/auth/use-sign-in';
import { useDashboardActivity } from '~/features/multisig/vaults/use-dashboard-activity';
import { useVaults } from '~/features/multisig/vaults/use-vaults';

import type { VaultSummary } from '@leather.io/models';
import { Button, ListContainer, PlusIcon } from '@leather.io/ui';

import { ActivityEmptyState } from '../components/activity-empty-state';
import { ChainAvatar } from '../components/chain-avatar';
import { InvitationModal } from '../components/invitation-modal';
import { MultisigPage } from '../components/multisig-page';
import { SectionLabel } from '../components/section-label';
import { VaultActivityList } from '../components/vault-activity-list';
import type { Chain } from '../data/multisig-types';
import { multisigPaths } from '../multisig.constants';
import { CreateVaultTile } from './components/create-vault-tile';
import { VaultCard } from './components/vault-card';

function EmptyVaults({ onCreate }: { onCreate(): void }) {
  return (
    <ListContainer height="100%">
      <Flex
        direction="column"
        alignItems="flex-start"
        justifyContent="center"
        textAlign="left"
        gap="space.03"
        minHeight="288px"
        py="space.06"
        px="space.05"
      >
        <styled.h3 textStyle="heading.05" color="ink.text-primary">
          No vaults yet
        </styled.h3>
        <styled.p textStyle="body.02" color="ink.text-subdued" maxWidth="360px">
          Vaults are chain-specific. Create one to get started. Any invite you receive shows up here
          automatically.
        </styled.p>
        <Box mt="space.02">
          <Button variant="solid" iconStart={PlusIcon} onClick={onCreate}>
            Create vault
          </Button>
        </Box>
      </Flex>
    </ListContainer>
  );
}

function ActivityFeed({
  items,
  isLoading,
  vaultNamesById,
  accountNamesById,
  accountThresholdsById,
  onOpen,
}: {
  items: VaultActivityItem[];
  isLoading: boolean;
  vaultNamesById: ReadonlyMap<string, string>;
  accountNamesById: ReadonlyMap<string, string>;
  accountThresholdsById: ReadonlyMap<string, string>;
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
  if (items.length === 0)
    return <ActivityEmptyState description="Transactions across your vaults will appear here." />;
  return (
    <VaultActivityList
      items={items}
      scale="compact"
      limit={10}
      vaultNamesById={vaultNamesById}
      accountNamesById={accountNamesById}
      accountThresholdsById={accountThresholdsById}
      onSelect={onOpen}
    />
  );
}

function ConnectChainPrompt({
  chain,
  onConnect,
  isPending,
  error,
}: {
  chain: Chain;
  onConnect(): void;
  isPending: boolean;
  error?: string;
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
        {error && (
          <styled.p textStyle="caption.01" color="red.action-primary-default" mt="space.02">
            {error}
          </styled.p>
        )}
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
  const { btc: btcNetwork, stx: stxNetwork } = useMultisigNetworks();
  const btcVaults = useVaults(btcNetwork);
  const stxVaults = useVaults(stxNetwork);
  const btcSession = useSession(btcNetwork);
  const stxSession = useSession(stxNetwork);
  const btcSignIn = useSignIn(btcNetwork);
  const stxSignIn = useSignIn(stxNetwork);

  const vaults = [...(btcVaults.data ?? []), ...(stxVaults.data ?? [])];
  const {
    items: activityItems,
    isLoading: isLoadingActivity,
    vaultNamesById,
    accountNamesById,
    accountThresholdsById,
  } = useDashboardActivity(vaults);

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
    <MultisigPage title="Multisig">
      <Flex
        direction={['column', 'column', 'row']}
        gap={['space.06', 'space.06', 'space.08', 'space.10']}
        alignItems="flex-start"
      >
        <Box flex={['1', '1', '1.6']} width="100%">
          <SectionLabel noGutter>My vaults</SectionLabel>
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
              error={btcSignIn.error?.message}
            />
          )}
          {!stxSession && (
            <ConnectChainPrompt
              chain="stx"
              onConnect={() => stxSignIn.mutate()}
              isPending={stxSignIn.isPending}
              error={stxSignIn.error?.message}
            />
          )}
        </Box>
        <Box flex={['1', '1', '1']} width="100%" maxWidth={['unset', 'unset', '450px']}>
          <SectionLabel noGutter>Activity</SectionLabel>
          <ActivityFeed
            items={activityItems}
            isLoading={isLoadingActivity}
            vaultNamesById={vaultNamesById}
            accountNamesById={accountNamesById}
            accountThresholdsById={accountThresholdsById}
            onOpen={(targetVaultId, txId) => void navigate(multisigPaths.tx(targetVaultId, txId))}
          />
        </Box>
      </Flex>

      {inviteVault && (
        <InvitationModal vault={inviteVault} isShowing onClose={() => setInviteVault(null)} />
      )}
    </MultisigPage>
  );
}

export function MultisigDashboardSkeleton() {
  return (
    <MultisigPage title="Multisig">
      <Flex
        direction={['column', 'column', 'row']}
        gap={['space.06', 'space.06', 'space.08', 'space.10']}
      >
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
    </MultisigPage>
  );
}
