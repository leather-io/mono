import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Box, Circle, Flex, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

import { PlusIcon } from '@leather.io/ui';

import { AvatarSq } from '../components/avatar-sq';
import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigHero } from '../components/multisig-hero';
import { useMultisigToast } from '../components/multisig-toast';
import { TxRow } from '../components/tx-row';
import { SendModal } from '../modals/send-modal';
import { multisigPaths } from '../multisig.constants';
import { useVaultAccount } from '../store/use-multisig';
import { AccountDetailsCard } from './components/account-details-card';

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

export function AccountDetailPage() {
  const { vaultId, accountId } = useParams();
  const { vault, account } = useVaultAccount(vaultId, accountId);
  const navigate = useNavigate();
  const { showToast } = useMultisigToast();
  const [sendOpen, setSendOpen] = useState(false);
  const [added, setAdded] = useState(false);

  if (!vault || !account) {
    return (
      <Page>
        <Page.Header
          title="Account"
          backTo={vault ? multisigPaths.vault(vault.id) : multisigPaths.index}
        />
        <MultisigErrorState body="This account isn't part of the current session." />
      </Page>
    );
  }

  const txs = vault.transactions.filter(tx => tx.accountId === account.id);

  function onAddToWallet() {
    setAdded(true);
    showToast('Account added to your wallet');
  }

  return (
    <Page>
      <Page.Header
        title={account.name}
        backTo={multisigPaths.vault(vault.id)}
        icon={<AvatarSq chain={vault.chain} icon={account.icon} themeId={vault.theme} size="sm" />}
      />
      <Flex direction={['column', 'column', 'row']} gap="space.06" alignItems="flex-start">
        <Box flex={['1', '1', '1.6']} width="100%">
          <MultisigHero
            themeId={vault.theme}
            primary={account.balanceSub}
            secondary={formatUsd(account.balanceUsd)}
          />
          <SectionLabel>Transactions</SectionLabel>
          <Box
            borderRadius="md"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="ink.border-default"
            p="space.02"
          >
            <styled.button
              type="button"
              onClick={() => setSendOpen(true)}
              display="flex"
              alignItems="center"
              gap="space.03"
              width="100%"
              textAlign="left"
              cursor="pointer"
              px="space.03"
              py="space.03"
              borderRadius="sm"
              bg="transparent"
              _hover={{ bg: 'ink.component-background-hover' }}
            >
              <Circle size="32px" bg="ink.background-secondary" flexShrink={0}>
                <PlusIcon variant="small" />
              </Circle>
              <Box flex={1} minWidth={0}>
                <styled.div textStyle="label.02">Create transaction</styled.div>
                <styled.div textStyle="caption.01" color="ink.text-subdued">
                  Propose a new {vault.chain === 'btc' ? 'BTC' : 'STX'} transfer for this account
                </styled.div>
              </Box>
            </styled.button>
            {txs.map(tx => (
              <TxRow
                key={tx.id}
                tx={tx}
                vault={vault}
                onClick={() => navigate(multisigPaths.tx(vault.id, tx.id))}
              />
            ))}
            {txs.length === 0 && (
              <styled.div
                textStyle="caption.01"
                color="ink.text-subdued"
                textAlign="center"
                py="space.05"
              >
                No transactions in this account yet.
              </styled.div>
            )}
          </Box>
        </Box>
        <Box flex={['1', '1', '1']} width="100%">
          <SectionLabel>Account details</SectionLabel>
          <AccountDetailsCard
            vault={vault}
            account={account}
            added={added}
            onAddToWallet={onAddToWallet}
          />
        </Box>
      </Flex>

      {sendOpen && (
        <SendModal vault={vault} account={account} isShowing onClose={() => setSendOpen(false)} />
      )}
    </Page>
  );
}
