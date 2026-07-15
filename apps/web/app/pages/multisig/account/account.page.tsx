import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { Balance } from '~/components/balance/balance';
import { useVaultAccountAssets } from '~/features/multisig/assets/use-vault-account-assets';
import type { VaultAssetItem } from '~/features/multisig/assets/vault-asset-items';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { useSession } from '~/features/multisig/auth/use-session';
import { useIsRestoringSession } from '~/features/multisig/auth/use-session-bootstrap';
import { resolveWalletRpcNetwork } from '~/features/multisig/network/resolve-wallet-rpc-network';
import { getMultisigDescriptor } from '~/features/multisig/transactions/btc-multisig-descriptor';
import { getOrderedSigningPubkeys } from '~/features/multisig/transactions/derive-multisig-address';
import { useMultisigMe } from '~/features/multisig/vaults/use-multisig-me';
import { useVaultAccountBalance } from '~/features/multisig/vaults/use-vault-account-balance';
import { useVaultAccount } from '~/features/multisig/vaults/use-vault-accounts';
import { useVault, useVaults } from '~/features/multisig/vaults/use-vaults';
import { useToast } from '~/features/toasts/use-toast';
import { formatCurrency } from '~/utils/currency-formatter';
import { leather } from '~/utils/leather-sdk';
import { isLeatherInstalled } from '~/utils/utils';

import type { AuthNetworkId, MultisigTransaction } from '@leather.io/models';
import { PlusIcon } from '@leather.io/ui';
import type { SerializedCryptoAssetId } from '@leather.io/utils';

import { InlineTabs } from '../components/inline-tabs';
import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigHero } from '../components/multisig-hero';
import { MultisigPage } from '../components/multisig-page';
import { SectionLabel } from '../components/section-label';
import { vaultThemeFromName } from '../multisig-tokens';
import { multisigPaths } from '../multisig.constants';
import { chainFromNetwork } from '../multisig.utils';
import { AccountAssets } from './components/account-assets';
import { AccountDetailsCard } from './components/account-details-card';
import { AccountTransactions } from './components/account-transactions';
import { AssetDetailModal } from './components/asset-detail-modal';
import { ProposeTransactionModal } from './components/propose-transaction-modal';
import { ReceiveModal } from './components/receive-modal';

export function AccountDetailPage() {
  const { vaultId, accountId } = useParams();
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [proposeAssetId, setProposeAssetId] = useState<SerializedCryptoAssetId>();
  const [isAddingToWallet, setIsAddingToWallet] = useState(false);
  const [assetDetail, setAssetDetail] = useState<VaultAssetItem | null>(null);
  const { success, error } = useToast();
  useEffect(() => setHydrated(true), []);

  function onProposed(transaction: MultisigTransaction) {
    setIsProposing(false);
    if (!vaultId) return;
    void navigate(multisigPaths.tx(vaultId, transaction.id), { state: { autoSign: true } });
  }

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
  const accountAssets = useVaultAccountAssets(account.data);

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

  async function onAddToWallet() {
    if (!vault.data || !account.data) return;
    if (!isLeatherInstalled()) {
      error('Leather wallet not detected. Install the Leather extension to add this account.');
      return;
    }

    const accountData = account.data;
    const network = resolveWalletRpcNetwork(vault.data.network);

    setIsAddingToWallet(true);
    try {
      if (chainFromNetwork(accountData.network) === 'btc') {
        await leather.btcAddAccount({
          descriptor: getMultisigDescriptor(accountData),
          name: accountData.name,
          network,
        });
      } else {
        await leather.stxAddAccount({
          publicKeys: getOrderedSigningPubkeys(accountData),
          threshold: accountData.threshold,
          name: accountData.name,
          network,
        });
      }
      success(`Added "${accountData.name}" to your wallet`);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to add account to wallet');
    } finally {
      setIsAddingToWallet(false);
    }
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
            variant="balance"
            themeId={theme.id}
            primary={<Balance balance={accountBalance.crypto} formatCurrency={formatCurrency} />}
            secondary={<Balance balance={accountBalance.fiat} formatCurrency={formatCurrency} />}
          />
          <styled.button
            type="button"
            onClick={() => {
              setProposeAssetId(undefined);
              setIsProposing(true);
            }}
            width="100%"
            display="flex"
            alignItems="center"
            gap="space.03"
            p="space.04"
            mt="space.05"
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
          <InlineTabs.Root defaultValue="transactions">
            <InlineTabs.List>
              <InlineTabs.Trigger value="transactions">Transactions</InlineTabs.Trigger>
              <InlineTabs.Trigger value="assets">Assets</InlineTabs.Trigger>
            </InlineTabs.List>
            <InlineTabs.Content value="transactions">
              <Box mt="space.04">
                <AccountTransactions account={account.data} />
              </Box>
            </InlineTabs.Content>
            <InlineTabs.Content value="assets">
              <Box mt="space.04">
                <AccountAssets assets={accountAssets} onSelectAsset={setAssetDetail} />
              </Box>
            </InlineTabs.Content>
          </InlineTabs.Root>
        </Box>
        <Box flex={['1', '1', '1']} width="100%">
          <SectionLabel noGutter>Account details</SectionLabel>
          <AccountDetailsCard
            vault={vault.data}
            account={account.data}
            currentUserAddress={me.data?.address}
            onAddToWallet={onAddToWallet}
            isAddingToWallet={isAddingToWallet}
          />
        </Box>
      </Flex>
      <ProposeTransactionModal
        key={proposeAssetId ?? 'default'}
        account={account.data}
        memberCount={vault.data.members.length}
        isShowing={isProposing}
        initialAssetId={proposeAssetId}
        onClose={() => setIsProposing(false)}
        onProposed={onProposed}
      />
      {assetDetail ? (
        <AssetDetailModal
          account={account.data}
          item={assetDetail}
          onClose={() => setAssetDetail(null)}
          onSend={item => {
            setAssetDetail(null);
            setProposeAssetId(item.id);
            setIsProposing(true);
          }}
          onReceive={() => {
            setAssetDetail(null);
            setIsReceiving(true);
          }}
        />
      ) : null}
      {isReceiving ? (
        <ReceiveModal account={account.data} onClose={() => setIsReceiving(false)} />
      ) : null}
    </MultisigPage>
  );
}
