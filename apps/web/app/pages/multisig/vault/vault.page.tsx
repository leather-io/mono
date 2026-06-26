import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Box, Flex } from 'leather-styles/jsx';
import { useSession } from '~/features/multisig/auth/use-session';
import { useIsRestoringSession } from '~/features/multisig/auth/use-session-bootstrap';
import { useMultisigMe } from '~/features/multisig/vaults/use-multisig-me';
import { useVaultAccountsBalance } from '~/features/multisig/vaults/use-vault-account-balance';
import { useVaultAccounts } from '~/features/multisig/vaults/use-vault-accounts';
import {
  useCancelVault,
  useDeclineVault,
  useJoinVault,
} from '~/features/multisig/vaults/use-vault-mutations';
import { useVault, useVaults } from '~/features/multisig/vaults/use-vaults';
import { useToast } from '~/features/toasts/use-toast';

import type { AuthNetworkId, Vault } from '@leather.io/models';
import { Button, Callout } from '@leather.io/ui';

import { Badge } from '../components/badge';
import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigPage } from '../components/multisig-page';
import { SectionLabel } from '../components/section-label';
import { multisigPaths } from '../multisig.constants';
import { AccountsSection } from './components/accounts-section';
import { CancelVaultModal } from './components/cancel-vault-modal';
import { CreateAccountModal } from './components/create-account-modal';
import { MembersSection } from './components/members-section';
import { ShareInvitationsModal } from './components/share-invitations-modal';
import { VaultBalanceHero } from './components/vault-balance-hero';
import { VaultStatusCard } from './components/vault-status-card';
import { VaultTransactions } from './components/vault-transactions';

function accountCreationBlockedReason(vault: Vault): string {
  if (vault.status === 'cancelled') return 'This vault has been cancelled.';
  if (vault.members.some(member => member.membershipStatus === 'declined')) {
    return "A member declined, so this vault can't add accounts. The creator can cancel and start over.";
  }
  return 'All members must accept their invitation before accounts can be created.';
}

export function VaultDetailPage() {
  const { vaultId } = useParams();
  const navigate = useNavigate();
  const { success: showToast } = useToast();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isSharingInvites, setIsSharingInvites] = useState(false);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const btcVaults = useVaults('btc:mainnet');
  const stxVaults = useVaults('stx:mainnet');
  const inBtc = btcVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const inStx = stxVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const vaultNetworkKnown = inBtc || inStx;

  const btcVault = useVault('btc:mainnet', inBtc ? vaultId : undefined);
  const stxVault = useVault('stx:mainnet', inStx ? vaultId : undefined);
  const vault = btcVault.data ?? stxVault.data;
  const network: AuthNetworkId = vault?.network ?? (inStx ? 'stx:mainnet' : 'btc:mainnet');

  const btcSession = useSession('btc:mainnet');
  const stxSession = useSession('stx:mainnet');
  const restoringBtc = useIsRestoringSession('btc:mainnet');
  const restoringStx = useIsRestoringSession('stx:mainnet');
  const sessionsRestoring = restoringBtc || restoringStx;
  const listsSettled = (!btcSession || btcVaults.isSuccess) && (!stxSession || stxVaults.isSuccess);
  const detailResolving = vaultNetworkKnown && !(btcVault.isSuccess || stxVault.isSuccess);
  const isResolving = !hydrated || sessionsRestoring || !listsSettled || detailResolving;

  const me = useMultisigMe(vaultNetworkKnown ? network : undefined);
  const accounts = useVaultAccounts(network, vaultNetworkKnown ? vaultId : undefined);
  const accountsBalance = useVaultAccountsBalance(accounts.data);
  const cancelVault = useCancelVault(network);
  const joinVault = useJoinVault(network);
  const declineVault = useDeclineVault(network);

  if (!vault) {
    return (
      <MultisigPage title="Vault" backTo={multisigPaths.index}>
        {isResolving ? (
          <Flex direction="column" gap="space.03">
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
          <MultisigErrorState body="No vault found. It may not exist, or you may not be a member." />
        )}
      </MultisigPage>
    );
  }

  const myMembership = vault.members.find(member => member.address === me.data?.address);
  const isInvited = myMembership?.membershipStatus === 'invited';
  const isCreator = vault.createdBy === me.data?.id;
  const canCancel = isCreator && vault.status === 'pending';
  const allMembersJoined = vault.members.every(member => member.membershipStatus === 'joined');
  const pendingCount = vault.members.filter(member => member.membershipStatus === 'invited').length;
  const canCreateAccount = vault.status !== 'cancelled' && allMembersJoined;
  const vaultDetailsHeading = `${vault.name.charAt(0).toUpperCase()}${vault.name.slice(1)} details`;
  const nextAccountIndex = accounts.data?.length
    ? Math.max(...accounts.data.map(account => account.accountIndex)) + 1
    : 0;

  function onCancel() {
    cancelVault.mutate(vault.id, {
      onSuccess() {
        showToast(`“${vault.name}” cancelled`);
        void navigate(multisigPaths.index);
      },
    });
  }

  return (
    <MultisigPage title={vault.name} backTo={multisigPaths.index}>
      {isInvited && myMembership && (
        <Callout variant="info" title="You've been invited to this vault">
          <Flex gap="space.03" mt="space.03">
            <Button
              variant="solid"
              disabled={joinVault.isPending || declineVault.isPending}
              aria-busy={joinVault.isPending}
              onClick={() => joinVault.mutate(myMembership.membershipId)}
            >
              Accept invite
            </Button>
            <Button
              variant="outline"
              disabled={joinVault.isPending || declineVault.isPending}
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

      <Flex
        direction={['column', 'column', 'row']}
        gap={['space.06', 'space.06', 'space.08', 'space.10']}
        alignItems="flex-start"
      >
        <Box flex={['1', '1', '1.6']} width="100%">
          <VaultBalanceHero
            vault={vault}
            crypto={accountsBalance.crypto}
            fiat={accountsBalance.fiat}
          />
          <SectionLabel>Vault accounts</SectionLabel>
          <AccountsSection
            vault={vault}
            accounts={accounts.data}
            isLoading={accounts.isLoading}
            canCreate={canCreateAccount}
            disabledReason={accountCreationBlockedReason(vault)}
            onCreateAccount={() => setIsCreatingAccount(true)}
            onOpenAccount={accountId => navigate(multisigPaths.account(vault.id, accountId))}
          />
          <SectionLabel
            accessory={
              pendingCount > 0 ? (
                <Badge variant="pending" label={`${pendingCount} pending`} />
              ) : undefined
            }
          >
            Vault members
          </SectionLabel>
          <MembersSection
            vault={vault}
            currentUserAddress={me.data?.address}
            onShareInvite={() => setIsSharingInvites(true)}
          />
        </Box>
        <Box flex={['1', '1', '1']} width="100%">
          <SectionLabel noGutter>{vaultDetailsHeading}</SectionLabel>
          <VaultStatusCard
            vault={vault}
            canCancel={canCancel}
            isCancelling={cancelVault.isPending}
            pendingCount={pendingCount}
            onShareInvite={() => setIsSharingInvites(true)}
            onCancelVault={() => setIsConfirmingCancel(true)}
          />
          <SectionLabel>Transactions</SectionLabel>
          <VaultTransactions network={network} vaultId={vault.id} accounts={accounts.data} />
        </Box>
      </Flex>

      <CreateAccountModal
        vault={vault}
        nextIndex={nextAccountIndex}
        isShowing={isCreatingAccount}
        onClose={() => setIsCreatingAccount(false)}
      />

      <ShareInvitationsModal
        vault={vault}
        currentUserAddress={me.data?.address}
        isShowing={isSharingInvites}
        onClose={() => setIsSharingInvites(false)}
      />

      <CancelVaultModal
        vaultName={vault.name}
        isShowing={isConfirmingCancel}
        isCancelling={cancelVault.isPending}
        onConfirm={onCancel}
        onClose={() => setIsConfirmingCancel(false)}
      />
    </MultisigPage>
  );
}
