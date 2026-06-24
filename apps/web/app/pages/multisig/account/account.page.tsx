import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { Balance } from '~/components/balance/balance';
import { useSession } from '~/features/multisig/auth/use-session';
import { useIsRestoringSession } from '~/features/multisig/auth/use-session-bootstrap';
import { useMultisigMe } from '~/features/multisig/vaults/use-multisig-me';
import { useVaultAccountBalance } from '~/features/multisig/vaults/use-vault-account-balance';
import { useVaultAccount } from '~/features/multisig/vaults/use-vault-accounts';
import { useVault, useVaults } from '~/features/multisig/vaults/use-vaults';
import { Page } from '~/layouts/page/page';
import { formatCurrency } from '~/utils/currency-formatter';

import type { AuthNetworkId } from '@leather.io/models';

import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigHero } from '../components/multisig-hero';
import { vaultThemeFromName } from '../multisig-tokens';
import { multisigPaths } from '../multisig.constants';
import { AccountDetailsCard } from './components/account-details-card';
import { AccountTransactions } from './components/account-transactions';

function SectionLabel({ children, noGutter }: { children: string; noGutter?: boolean }) {
  return (
    <styled.h3
      textStyle="label.01"
      color="ink.text-primary"
      mb="space.03"
      mt={noGutter ? undefined : 'space.05'}
    >
      {children}
    </styled.h3>
  );
}

export function AccountDetailPage() {
  const { vaultId, accountId } = useParams();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const btcVaults = useVaults('btc:mainnet');
  const stxVaults = useVaults('stx:mainnet');
  const inBtc = btcVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const inStx = stxVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const vaultNetworkKnown = inBtc || inStx;
  const network: AuthNetworkId = inStx ? 'stx:mainnet' : 'btc:mainnet';

  const vault = useVault(network, vaultNetworkKnown ? vaultId : undefined);
  const account = useVaultAccount(network, vaultNetworkKnown ? accountId : undefined);
  const me = useMultisigMe(vaultNetworkKnown ? network : undefined);
  const accountBalance = useVaultAccountBalance(account.data);

  const btcSession = useSession('btc:mainnet');
  const stxSession = useSession('stx:mainnet');
  const restoringBtc = useIsRestoringSession('btc:mainnet');
  const restoringStx = useIsRestoringSession('stx:mainnet');
  const sessionsRestoring = restoringBtc || restoringStx;
  const listsSettled = (!btcSession || btcVaults.isSuccess) && (!stxSession || stxVaults.isSuccess);
  const detailResolving = vaultNetworkKnown && !(vault.isSuccess && account.isSuccess);
  const isResolving = !hydrated || sessionsRestoring || !listsSettled || detailResolving;

  if (!vault.data || !account.data) {
    return (
      <Page>
        <Page.Header
          title="Vault account"
          backTo={vaultId ? multisigPaths.vault(vaultId) : multisigPaths.index}
        />
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
          <MultisigErrorState body="No account found. It may not exist, or you may not be a member." />
        )}
      </Page>
    );
  }

  const theme = vaultThemeFromName(vault.data.theme);

  function onAddToWallet() {
    // TODO: add this multisig account to the extension wallet
  }

  return (
    <Page>
      <Page.Header title="Vault account" backTo={multisigPaths.vault(vault.data.id)} />
      <Flex
        direction={['column', 'column', 'row']}
        gap="space.06"
        alignItems="flex-start"
        mt="space.07"
      >
        <Box flex={['1', '1', '1.6']} width="100%">
          <MultisigHero
            themeId={theme.id}
            primary={<Balance balance={accountBalance.crypto} formatCurrency={formatCurrency} />}
            secondary={<Balance balance={accountBalance.fiat} formatCurrency={formatCurrency} />}
          />
          <SectionLabel>Transactions</SectionLabel>
          <AccountTransactions network={network} accountId={accountId} />
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
    </Page>
  );
}
