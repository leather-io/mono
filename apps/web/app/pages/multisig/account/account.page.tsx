import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { Balance } from '~/components/balance/balance';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { useSession } from '~/features/multisig/auth/use-session';
import { useIsRestoringSession } from '~/features/multisig/auth/use-session-bootstrap';
import { useMultisigMe } from '~/features/multisig/vaults/use-multisig-me';
import { useVaultAccountBalance } from '~/features/multisig/vaults/use-vault-account-balance';
import { useVaultAccount } from '~/features/multisig/vaults/use-vault-accounts';
import { useVault, useVaults } from '~/features/multisig/vaults/use-vaults';
import { formatCurrency } from '~/utils/currency-formatter';

import type { AuthNetworkId } from '@leather.io/models';
import { PlusIcon } from '@leather.io/ui';

import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigHero } from '../components/multisig-hero';
import { MultisigPage } from '../components/multisig-page';
import { SectionLabel } from '../components/section-label';
import { vaultThemeFromName } from '../multisig-tokens';
import { multisigPaths } from '../multisig.constants';
import { AccountDetailsCard } from './components/account-details-card';
import { AccountTransactions } from './components/account-transactions';
import { ProposeTransactionModal } from './components/propose-transaction-modal';

export function AccountDetailPage() {
  const { vaultId, accountId } = useParams();
  const [hydrated, setHydrated] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
  useEffect(() => setHydrated(true), []);

  const { btc: btcNetwork, stx: stxNetwork } = useMultisigNetworks();
  const btcVaults = useVaults(btcNetwork);
  const stxVaults = useVaults(stxNetwork);
  const inBtc = btcVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const inStx = stxVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const vaultNetworkKnown = inBtc || inStx;
  const network: AuthNetworkId = inStx ? stxNetwork : btcNetwork;

  const vault = useVault(network, vaultNetworkKnown ? vaultId : undefined);
  const account = useVaultAccount(network, vaultNetworkKnown ? accountId : undefined);
  const me = useMultisigMe(vaultNetworkKnown ? network : undefined);
  const accountBalance = useVaultAccountBalance(account.data);

  const btcSession = useSession(btcNetwork);
  const stxSession = useSession(stxNetwork);
  const restoringBtc = useIsRestoringSession(btcNetwork);
  const restoringStx = useIsRestoringSession(stxNetwork);
  const sessionsRestoring = restoringBtc || restoringStx;
  const listsSettled = (!btcSession || btcVaults.isSuccess) && (!stxSession || stxVaults.isSuccess);
  const detailResolving = vaultNetworkKnown && !(vault.isSuccess && account.isSuccess);
  const isResolving = !hydrated || sessionsRestoring || !listsSettled || detailResolving;

  if (!vault.data || !account.data) {
    return (
      <MultisigPage
        title="Vault account"
        backTo={vaultId ? multisigPaths.vault(vaultId) : multisigPaths.index}
      >
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
          <MultisigErrorState body="No account found. It may not exist, or you may not be a member." />
        )}
      </MultisigPage>
    );
  }

  const theme = vaultThemeFromName(vault.data.theme);
  const chainLabel = account.data.network.startsWith('btc') ? 'BTC' : 'STX';

  function onAddToWallet() {
    // TODO: add this multisig account to the extension wallet
  }

  return (
    <MultisigPage title="Vault account" backTo={multisigPaths.vault(vault.data.id)}>
      <Flex
        direction={['column', 'column', 'row']}
        gap={['space.06', 'space.06', 'space.08', 'space.10']}
        alignItems="flex-start"
      >
        <Box flex={['1', '1', '1.6']} width="100%">
          <MultisigHero
            themeId={theme.id}
            primary={<Balance balance={accountBalance.crypto} formatCurrency={formatCurrency} />}
            secondary={<Balance balance={accountBalance.fiat} formatCurrency={formatCurrency} />}
          />
          <SectionLabel>Transactions</SectionLabel>
          <styled.button
            type="button"
            onClick={() => setIsProposing(true)}
            width="100%"
            display="flex"
            alignItems="center"
            gap="space.03"
            p="space.04"
            mb="space.03"
            borderRadius="md"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="ink.border-default"
            bg="transparent"
            cursor="pointer"
            textAlign="left"
            _hover={{ bg: 'ink.component-background-hover' }}
          >
            <Flex
              alignItems="center"
              justifyContent="center"
              width="40px"
              height="40px"
              borderRadius="round"
              bg="ink.text-primary"
              flexShrink={0}
            >
              <PlusIcon variant="small" color="ink.background-primary" />
            </Flex>
            <Box>
              <styled.div textStyle="label.02">Create transaction</styled.div>
              <styled.div textStyle="caption.01" color="ink.text-subdued">
                Propose a new {chainLabel} transfer for this account
              </styled.div>
            </Box>
          </styled.button>
          <AccountTransactions network={network} vaultId={vaultId} accountId={accountId} />
        </Box>
        <Box flex={['1', '1', '1']} width="100%">
          <SectionLabel noGutter>Account details</SectionLabel>
          <AccountDetailsCard
            vault={vault.data}
            account={account.data}
            currentUserAddress={me.data?.address}
            onAddToWallet={onAddToWallet}
          />
        </Box>
      </Flex>
      <ProposeTransactionModal
        account={account.data}
        memberCount={vault.data.members.length}
        isShowing={isProposing}
        onClose={() => setIsProposing(false)}
      />
    </MultisigPage>
  );
}
