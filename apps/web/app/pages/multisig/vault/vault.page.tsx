import { useNavigate, useParams } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useMultisigMe } from '~/features/multisig/vaults/use-multisig-me';
import {
  useCancelVault,
  useDeclineVault,
  useJoinVault,
} from '~/features/multisig/vaults/use-vault-mutations';
import { useVault } from '~/features/multisig/vaults/use-vaults';
import { useToast } from '~/features/toasts/use-toast';
import { Page } from '~/layouts/page/page';

import type { AuthNetworkId } from '@leather.io/models';
import { Button, Callout } from '@leather.io/ui';

import { MultisigErrorState } from '../components/multisig-error-state';
import { multisigPaths } from '../multisig.constants';
import { MembersSection } from './components/members-section';
import { VaultStatusCard } from './components/vault-status-card';

function SectionLabel({ children }: { children: string }) {
  return (
    <styled.h3 textStyle="label.02" color="ink.text-subdued" mb="space.03" mt="space.05">
      {children}
    </styled.h3>
  );
}

function ComingSoon({ children }: { children: string }) {
  return (
    <Box
      borderRadius="md"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="ink.border-default"
      p="space.05"
      textAlign="center"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {children}
      </styled.span>
    </Box>
  );
}

export function VaultDetailPage() {
  const { vaultId } = useParams();
  const navigate = useNavigate();
  const { success: showToast } = useToast();

  const btcVault = useVault('btc:mainnet', vaultId);
  const stxVault = useVault('stx:mainnet', vaultId);
  const vault = btcVault.data ?? stxVault.data;
  const network: AuthNetworkId = vault?.network ?? 'btc:mainnet';
  const isLoading = btcVault.isLoading || stxVault.isLoading;
  const hasFetched = btcVault.isFetched || stxVault.isFetched;

  const me = useMultisigMe(network);
  const cancelVault = useCancelVault(network);
  const joinVault = useJoinVault(network);
  const declineVault = useDeclineVault(network);

  if (!vault) {
    const isResolving = isLoading || !hasFetched;
    return (
      <Page>
        <Page.Header title="Vault" backTo={multisigPaths.index} />
        {isResolving ? (
          <Flex direction="column" gap="space.03" mt="space.05">
            {[0, 1, 2].map(index => (
              <Box
                key={index}
                height="64px"
                borderRadius="md"
                bg="ink.component-background-default"
                opacity={0.6}
              />
            ))}
          </Flex>
        ) : (
          <MultisigErrorState
            body={
              <>
                No vault found for <styled.code>{vaultId}</styled.code> — it may not exist or you
                may not be a member.
              </>
            }
          />
        )}
      </Page>
    );
  }

  const myMembership = vault.members.find(member => member.address === me.data?.address);
  const isInvited = myMembership?.membershipStatus === 'invited';
  const isCreator = vault.createdBy === me.data?.address || vault.createdBy === me.data?.id;
  const canCancel = isCreator && vault.status === 'pending';

  function onCancel() {
    cancelVault.mutate(vault.id, {
      onSuccess() {
        showToast(`“${vault.name}” cancelled`);
        void navigate(multisigPaths.index);
      },
    });
  }

  return (
    <Page>
      <Page.Header title={vault.name} backTo={multisigPaths.index} />

      {isInvited && myMembership && (
        <Callout variant="info" title="You've been invited to this vault">
          <Flex gap="space.03" mt="space.03">
            <Button
              variant="solid"
              aria-busy={joinVault.isPending}
              onClick={() => joinVault.mutate(myMembership.membershipId)}
            >
              Accept invite
            </Button>
            <Button
              variant="outline"
              aria-busy={declineVault.isPending}
              onClick={() =>
                declineVault.mutate(myMembership.membershipId, {
                  onSuccess: () => void navigate(multisigPaths.index),
                })
              }
            >
              Decline
            </Button>
          </Flex>
        </Callout>
      )}

      <Flex direction={['column', 'column', 'row']} gap="space.06" alignItems="flex-start">
        <Box flex={['1', '1', '1.6']} width="100%">
          <SectionLabel>Vault members</SectionLabel>
          <MembersSection vault={vault} currentUserAddress={me.data?.address} />
          <SectionLabel>Vault accounts</SectionLabel>
          <ComingSoon>
            Vault accounts will appear here once account creation is available.
          </ComingSoon>
        </Box>
        <Box flex={['1', '1', '1']} width="100%">
          <SectionLabel>Vault details</SectionLabel>
          <VaultStatusCard
            vault={vault}
            canCancel={canCancel}
            isCancelling={cancelVault.isPending}
            onCancelVault={onCancel}
          />
          <SectionLabel>Transactions</SectionLabel>
          <ComingSoon>
            Transactions will appear here once the activity feed is available.
          </ComingSoon>
        </Box>
      </Flex>
    </Page>
  );
}
