import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

import { Button } from '@leather.io/ui';

import { TxRow } from '../components/tx-row';
import type { Vault } from '../data/multisig-types';
import { InviteAcceptModal } from '../modals/invite-accept-modal';
import { multisigPaths } from '../multisig.constants';
import { useMultisigActions, useRecentTransactions, useVaults } from '../store/use-multisig';
import { CreateVaultTile } from './components/create-vault-tile';
import { VaultCard } from './components/vault-card';

function SectionLabel({ children }: { children: string }) {
  return (
    <styled.h3 textStyle="label.02" color="ink.text-subdued" mb="space.03">
      {children}
    </styled.h3>
  );
}

// Dev-only affordance so reviewers can walk zero → create → populated without a
// state switcher. Resets the in-memory session; disappears at extraction.
function PreviewDataControls() {
  const { resetSession } = useMultisigActions();
  return (
    <Flex alignItems="center" gap="space.02" mb="space.05">
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        Preview data:
      </styled.span>
      <Button variant="ghost" onClick={() => resetSession('seed')}>
        Populated
      </Button>
      <Button variant="ghost" onClick={() => resetSession('empty')}>
        Empty
      </Button>
    </Flex>
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

export function MultisigDashboardPage() {
  const navigate = useNavigate();
  const vaults = useVaults();
  const recentTxs = useRecentTransactions(5);
  const [inviteVault, setInviteVault] = useState<Vault | null>(null);

  // Invited vaults float to the top so pending invitations are seen first.
  const sortedVaults = vaults.slice().sort((a, b) => (b.invited ? 1 : 0) - (a.invited ? 1 : 0));

  return (
    <Page>
      <Page.Header title="Multisig" />
      <PreviewDataControls />
      <Flex direction={['column', 'column', 'row']} gap="space.06" alignItems="flex-start">
        <Box flex={['1', '1', '1.6']} width="100%">
          <SectionLabel>My vaults</SectionLabel>
          <Flex direction="column" gap="space.03">
            {sortedVaults.length === 0 && (
              <EmptyVaults onCreate={() => navigate(multisigPaths.createVault)} />
            )}
            {sortedVaults.map(vault => (
              <VaultCard
                key={vault.id}
                vault={vault}
                onClick={() =>
                  vault.invited ? setInviteVault(vault) : navigate(multisigPaths.vault(vault.id))
                }
              />
            ))}
            {sortedVaults.length > 0 && (
              <CreateVaultTile onClick={() => navigate(multisigPaths.createVault)} />
            )}
          </Flex>
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
            {recentTxs.length === 0 && <EmptyActivity />}
            {recentTxs.map(tx => (
              <TxRow
                key={`${tx.vault.id}-${tx.id}`}
                tx={tx}
                vault={tx.vault}
                showVaultName
                onClick={() => navigate(multisigPaths.tx(tx.vault.id, tx.id))}
              />
            ))}
          </Box>
        </Box>
      </Flex>

      {inviteVault && (
        <InviteAcceptModal vault={inviteVault} isShowing onClose={() => setInviteVault(null)} />
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
