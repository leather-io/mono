import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

import { AvatarSq } from '../components/avatar-sq';
import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigHero } from '../components/multisig-hero';
import { useMultisigToast } from '../components/multisig-toast';
import { TxRow } from '../components/tx-row';
import { CreateAccountModal } from '../modals/create-account-modal';
import { ShareInvitesModal } from '../modals/share-invites-modal';
import { multisigPaths } from '../multisig.constants';
import { useMultisigActions, useVault, useVaults } from '../store/use-multisig';
import { AccountsList } from './components/accounts-list';
import { MembersSection } from './components/members-section';
import { VaultStatusCard } from './components/vault-status-card';

function SectionLabel({ children }: { children: string }) {
  return (
    <styled.h3 textStyle="label.02" color="ink.text-subdued" mb="space.03" mt="space.05">
      {children}
    </styled.h3>
  );
}

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function VaultDetailPage() {
  const { vaultId } = useParams();
  const vault = useVault(vaultId);
  const vaults = useVaults();
  const navigate = useNavigate();
  const { cancelVault } = useMultisigActions();
  const { showToast } = useMultisigToast();
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  if (!vault) {
    return (
      <Page>
        <Page.Header title="Vault" backTo={multisigPaths.index} />
        <MultisigErrorState
          body={
            <>
              No vault with id <styled.code>{vaultId}</styled.code> in this session. Available:{' '}
              {vaults.map(v => v.id).join(', ') || 'none'}.
            </>
          }
        />
      </Page>
    );
  }

  function onCancel() {
    cancelVault(vault.id);
    showToast(`“${vault.name}” cancelled`);
    void navigate(multisigPaths.index);
  }

  return (
    <Page>
      <Page.Header
        title={vault.name}
        backTo={multisigPaths.index}
        icon={<AvatarSq chain={vault.chain} icon="vault" themeId={vault.theme} size="sm" />}
      />
      <Flex direction={['column', 'column', 'row']} gap="space.06" alignItems="flex-start">
        <Box flex={['1', '1', '1.6']} width="100%">
          <MultisigHero
            themeId={vault.theme}
            primary={vault.balanceSub}
            secondary={formatUsd(vault.balanceUsd)}
          />
          <SectionLabel>Vault accounts</SectionLabel>
          <AccountsList vault={vault} onCreate={() => setCreateAccountOpen(true)} />
          <SectionLabel>Vault members</SectionLabel>
          <MembersSection vault={vault} onShareInvite={() => setShareOpen(true)} />
        </Box>
        <Box flex={['1', '1', '1']} width="100%">
          <SectionLabel>Vault details</SectionLabel>
          <VaultStatusCard
            vault={vault}
            onShareInvites={() => setShareOpen(true)}
            onCancelVault={onCancel}
          />
          <SectionLabel>Transactions</SectionLabel>
          <Box
            borderRadius="md"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="ink.border-default"
            p="space.02"
          >
            {vault.transactions.length === 0 && (
              <styled.div
                textStyle="caption.01"
                color="ink.text-subdued"
                textAlign="center"
                py="space.06"
              >
                No transactions yet.
              </styled.div>
            )}
            {vault.transactions.map(tx => (
              <TxRow
                key={tx.id}
                tx={tx}
                vault={vault}
                onClick={() => navigate(multisigPaths.tx(vault.id, tx.id))}
              />
            ))}
          </Box>
        </Box>
      </Flex>

      {createAccountOpen && (
        <CreateAccountModal vault={vault} isShowing onClose={() => setCreateAccountOpen(false)} />
      )}
      {shareOpen && (
        <ShareInvitesModal vault={vault} isShowing onClose={() => setShareOpen(false)} />
      )}
    </Page>
  );
}
