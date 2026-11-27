import { useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { InlineLearnMoreLink } from '~/components/inline-learn-more-link';
import { useAddAccountToWallet } from '~/features/multisig/vaults/use-add-account-to-wallet';
import { useVaultAccount } from '~/features/multisig/vaults/use-vault-accounts';
import { useToast } from '~/features/toasts/use-toast';

import type { Vault, VaultAccount, VaultAccountSummary } from '@leather.io/models';
import { Button, ListContainer, ListItemBox, Sheet, SheetHeader } from '@leather.io/ui';

import { AccountWalletAvatar } from '../../components/account-wallet-avatar';
import { AddToExtensionButton } from '../../components/add-to-extension-button';
import { AvatarSq } from '../../components/avatar-sq';
import { defaultAccountIcon, vaultThemeFromName } from '../../multisig-tokens';
import { multisigGuides } from '../../multisig.constants';
import { chainFromNetwork } from '../../multisig.utils';
import styles from './vault-account-setup.module.css';

interface FirstVaultAccountPromptProps {
  vault: Vault;
  onClose(): void;
  onCreate(): void;
}

const exampleAccountAvatars: { icon: string; backgroundPosition: 'left' | 'center' | 'right' }[] = [
  { icon: defaultAccountIcon, backgroundPosition: 'center' },
  { icon: 'bank', backgroundPosition: 'left' },
  { icon: 'folder', backgroundPosition: 'right' },
];

export function FirstVaultAccountPrompt({
  vault,
  onClose,
  onCreate,
}: FirstVaultAccountPromptProps) {
  const title = 'Create the first account in this vault';
  const description = 'This vault needs an account to receive funds and propose transactions.';
  const chain = chainFromNetwork(vault.network);
  const theme = vaultThemeFromName(vault.theme);

  return (
    <Sheet
      isShowing
      onClose={onClose}
      variant="drawer"
      title={title}
      description={description}
      header={<SheetHeader variant="task" title={title} showCloseButton={false} />}
      footerFade={false}
      footer={
        <Flex justifyContent="flex-end" gap="space.03" width="100%">
          <Button variant="ghost" onClick={onClose}>
            Not now
          </Button>
          <Button onClick={onCreate}>Create account</Button>
        </Flex>
      }
    >
      <Flex direction="column" gap="space.04" px="space.05" pb="space.05">
        <styled.p textStyle="body.02" color="ink.text-primary">
          {description}
          <InlineLearnMoreLink
            href={multisigGuides.createAccount}
            subject="creating vault accounts"
          />
        </styled.p>
        <ListContainer p="space.03">
          <ListItemBox
            variant="plain"
            leading={
              <div className={styles.examples} aria-hidden="true">
                {exampleAccountAvatars.map(({ icon, backgroundPosition }) => (
                  <div key={icon} className={styles.example}>
                    <AvatarSq
                      chain={chain}
                      icon={icon}
                      themeId={theme.id}
                      size="lg"
                      backgroundPosition={backgroundPosition}
                    />
                  </div>
                ))}
              </div>
            }
            title="New vault account"
            caption={
              <styled.span whiteSpace="normal" textStyle="caption.01" color="ink.text-secondary">
                Choose a name, icon and signing threshold.
              </styled.span>
            }
          />
        </ListContainer>
      </Flex>
    </Sheet>
  );
}

const registrationDescription = 'Use this vault account with apps through Leather in this browser.';

function ExtensionHelpLink() {
  return (
    <InlineLearnMoreLink
      href={multisigGuides.addToExtension}
      subject="adding a vault account to Leather"
    />
  );
}

interface AccountRegistrationRowProps {
  themeId: number;
  account: VaultAccount | VaultAccountSummary;
  showWalletBadge?: boolean;
}

function AccountRegistrationRow({
  themeId,
  account,
  showWalletBadge = true,
}: AccountRegistrationRowProps) {
  const signerCount = 'signers' in account ? account.signers.length : account.signerCount;
  return (
    <ListItemBox
      variant="plain"
      density="compact"
      leading={
        showWalletBadge ? (
          <AccountWalletAvatar account={account} themeId={themeId} />
        ) : (
          <AvatarSq
            chain={chainFromNetwork(account.network)}
            icon={account.icon ?? defaultAccountIcon}
            themeId={themeId}
            size="lg"
          />
        )
      }
      title={
        <styled.span
          textStyle="label.02"
          color="ink.text-primary"
          whiteSpace="normal"
          overflowWrap="anywhere"
        >
          {account.name}
        </styled.span>
      }
      caption={
        <styled.span textStyle="caption.01" color="ink.text-secondary" whiteSpace="normal">
          {account.threshold} of {signerCount} approvals required
        </styled.span>
      }
    />
  );
}

interface AccountRegistrationBodyProps {
  vault: Vault;
  account: VaultAccount | VaultAccountSummary;
}

export function AccountRegistrationBody({ vault, account }: AccountRegistrationBodyProps) {
  return (
    <Flex direction="column" gap="space.04" px="space.05" pb="space.05">
      <styled.p textStyle="body.02" color="ink.text-primary">
        {registrationDescription}
        <ExtensionHelpLink />
      </styled.p>
      <ListContainer p="space.03">
        <AccountRegistrationRow themeId={vaultThemeFromName(vault.theme).id} account={account} />
      </ListContainer>
    </Flex>
  );
}

interface SingleVaultAccountPromptProps extends AccountRegistrationBodyProps {
  onClose(): void;
  onAdd(): void;
  isAdding: boolean;
}

export function SingleVaultAccountPrompt({
  vault,
  account,
  onClose,
  onAdd,
  isAdding,
}: SingleVaultAccountPromptProps) {
  const title = 'Add vault account to Leather';
  return (
    <Sheet
      isShowing
      onClose={onClose}
      variant="drawer"
      title={title}
      description={registrationDescription}
      header={<SheetHeader variant="task" title={title} showCloseButton={false} />}
      footerFade={false}
      footer={
        <Flex gap="space.03" justifyContent="flex-end" width="100%">
          <Button variant="ghost" onClick={onClose}>
            Not now
          </Button>
          <AddToExtensionButton
            aria-label={`Add to extension: ${account.name}`}
            onClick={onAdd}
            aria-busy={isAdding}
            disabled={isAdding}
          />
        </Flex>
      }
    >
      <AccountRegistrationBody vault={vault} account={account} />
    </Sheet>
  );
}

interface AddVaultAccountRowProps {
  account: VaultAccountSummary;
  themeId: number;
  isAdding: boolean;
  disabled: boolean;
  onAdd(loadAccount: () => Promise<VaultAccount | undefined>): Promise<void>;
}

function AddVaultAccountRow({
  account,
  themeId,
  isAdding,
  disabled,
  onAdd,
}: AddVaultAccountRowProps) {
  const details = useVaultAccount(account.network, account.id, false);

  async function loadAccount() {
    if (details.isSuccess) return details.data;
    return (await details.refetch({ throwOnError: true })).data;
  }

  return (
    <styled.li>
      <ListContainer p="space.03">
        <Flex alignItems="center" gap="space.02" flexWrap="wrap">
          <Box flex="1 1 198px" minWidth={0}>
            <AccountRegistrationRow account={account} themeId={themeId} showWalletBadge={false} />
          </Box>
          <AddToExtensionButton
            variant="outline"
            size="sm"
            ml="auto"
            aria-label={`Add to extension: ${account.name}`}
            aria-busy={isAdding}
            disabled={disabled}
            onClick={() => void onAdd(loadAccount)}
          />
        </Flex>
      </ListContainer>
    </styled.li>
  );
}

interface AddVaultAccountsPromptProps {
  vault: Vault;
  accounts: VaultAccountSummary[];
  onClose(): void;
}

export function AddVaultAccountsPrompt({ vault, accounts, onClose }: AddVaultAccountsPromptProps) {
  const [pendingAccountId, setPendingAccountId] = useState<string>();
  const { addAccountToWallet } = useAddAccountToWallet(vault);
  const { error } = useToast();
  const theme = vaultThemeFromName(vault.theme);
  const singleAccount = accounts.length === 1 ? accounts[0] : undefined;
  const singleAccountDetails = useVaultAccount(vault.network, singleAccount?.id, false);
  const title = 'Add vault accounts to Leather';
  const description = 'Choose which accounts to use with apps in this browser.';

  async function addAccount(
    accountId: string,
    loadAccount: () => Promise<VaultAccount | undefined>
  ) {
    setPendingAccountId(accountId);
    try {
      const account = await loadAccount();
      if (account) await addAccountToWallet(account);
    } catch {
      error('Couldn’t load the vault account. Try again.');
    } finally {
      setPendingAccountId(undefined);
    }
  }

  if (singleAccount) {
    return (
      <SingleVaultAccountPrompt
        vault={vault}
        account={singleAccount}
        isAdding={pendingAccountId !== undefined}
        onClose={onClose}
        onAdd={() =>
          void addAccount(singleAccount.id, async () => {
            if (singleAccountDetails.isSuccess) return singleAccountDetails.data;
            return (await singleAccountDetails.refetch({ throwOnError: true })).data;
          })
        }
      />
    );
  }

  return (
    <Sheet
      isShowing
      onClose={onClose}
      variant="drawer"
      title={title}
      description={description}
      header={<SheetHeader variant="task" title={title} showCloseButton={false} />}
      footerFade={false}
      footer={
        <Flex justifyContent="flex-end" width="100%">
          <Button variant="outline" onClick={onClose}>
            Not now
          </Button>
        </Flex>
      }
    >
      <Flex direction="column" gap="space.04" px="space.05" pb="space.05">
        <styled.p textStyle="body.02" color="ink.text-primary">
          {description}
          <ExtensionHelpLink />
        </styled.p>
        <styled.ul display="flex" flexDirection="column" gap="space.02">
          {accounts.map(account => (
            <AddVaultAccountRow
              key={account.id}
              account={account}
              themeId={theme.id}
              isAdding={pendingAccountId === account.id}
              disabled={pendingAccountId !== undefined}
              onAdd={loadAccount => addAccount(account.id, loadAccount)}
            />
          ))}
        </styled.ul>
      </Flex>
    </Sheet>
  );
}
