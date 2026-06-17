import { Box, Flex, styled } from 'leather-styles/jsx';
import { Balance } from '~/components/balance/balance';
import { useVaultAccountBalance } from '~/features/multisig/vaults/use-vault-account-balance';
import { formatCurrency } from '~/utils/currency-formatter';

import type { Vault, VaultAccountSummary } from '@leather.io/models';

import { AvatarSq } from '../../components/avatar-sq';
import { CopyAddress } from '../../components/copy-address';
import { VaultListItem } from '../../components/vault-list-item';
import { vaultThemeFromName } from '../../multisig-tokens';
import { chainFromNetwork } from '../../multisig.utils';

interface AccountsSectionProps {
  vault: Vault;
  accounts: VaultAccountSummary[] | undefined;
  isLoading: boolean;
  canCreate: boolean;
  disabledReason?: string;
  onCreateAccount(): void;
  onOpenAccount(accountId: string): void;
}

function AccountCard({
  vault,
  account,
  onOpen,
}: {
  vault: Vault;
  account: VaultAccountSummary;
  onOpen(): void;
}) {
  const theme = vaultThemeFromName(vault.theme);
  const chain = chainFromNetwork(vault.network);
  const { crypto, fiat } = useVaultAccountBalance(vault.network, account.multisigAddress);
  return (
    <Box
      position="relative"
      p="space.04"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      _hover={{ bg: 'ink.component-background-hover' }}
    >
      <styled.button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${account.name}`}
        position="absolute"
        inset="0"
        zIndex={0}
        bg="transparent"
        cursor="pointer"
        borderRadius="md"
      />
      <Box position="relative" zIndex={1} pointerEvents="none">
        <VaultListItem
          tightLeading
          leading={
            <AvatarSq
              chain={chain}
              icon={account.icon ?? 'piggybank'}
              themeId={theme.id}
              size="lg"
            />
          }
          title={
            <styled.span pl="space.02" textStyle="heading.05">
              {account.name}
            </styled.span>
          }
          caption={
            <styled.span display="inline-flex" pointerEvents="auto">
              <CopyAddress addr={account.multisigAddress} />
            </styled.span>
          }
          trailingTitle={
            <Balance balance={fiat} formatCurrency={formatCurrency} textStyle="heading.05" />
          }
          trailingSubtitle={
            <Balance
              balance={crypto}
              formatCurrency={formatCurrency}
              textStyle="caption.01"
              color="ink.text-subdued"
            />
          }
        />
      </Box>
    </Box>
  );
}

function CreateAccountTile({ onClick }: { onClick(): void }) {
  return (
    <styled.button
      type="button"
      onClick={onClick}
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="space.02"
      p="space.05"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="ink.border-default"
      bg="transparent"
      cursor="pointer"
      textStyle="label.02"
      color="ink.text-primary"
      _hover={{ bg: 'ink.component-background-hover' }}
    >
      <styled.span textStyle="heading.05" lineHeight="1">
        +
      </styled.span>
      Create new account
    </styled.button>
  );
}

function CreateAccountDisabled({ reason }: { reason?: string }) {
  return (
    <Box
      width="100%"
      p="space.05"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="ink.border-default"
      textAlign="center"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {reason ?? "New accounts can't be created for this vault."}
      </styled.span>
    </Box>
  );
}

export function AccountsSection({
  vault,
  accounts,
  isLoading,
  canCreate,
  disabledReason,
  onCreateAccount,
  onOpenAccount,
}: AccountsSectionProps) {
  return (
    <Flex direction="column" gap="space.03">
      {isLoading
        ? [0, 1].map(index => (
            <Box
              key={index}
              height="76px"
              borderRadius="md"
              bg="ink.component-background-default"
              opacity={0.6}
            />
          ))
        : accounts?.map(account => (
            <AccountCard
              key={account.id}
              vault={vault}
              account={account}
              onOpen={() => onOpenAccount(account.id)}
            />
          ))}
      {canCreate ? (
        <CreateAccountTile onClick={onCreateAccount} />
      ) : (
        <CreateAccountDisabled reason={disabledReason} />
      )}
    </Flex>
  );
}
