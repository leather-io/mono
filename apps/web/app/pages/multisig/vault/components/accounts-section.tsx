import { Box, Flex, styled } from 'leather-styles/jsx';
import { Balance } from '~/components/balance/balance';
import { CopyAddress } from '~/components/copy-address';
import { useVaultAccountBalance } from '~/features/multisig/vaults/use-vault-account-balance';
import { formatCryptoGlanceable, formatCurrency } from '~/utils/currency-formatter';

import type { Vault, VaultAccountSummary } from '@leather.io/models';
import { Button, ListItemBox, PlusIcon, Pressable } from '@leather.io/ui';

import { AvatarSq } from '../../components/avatar-sq';
import { vaultThemeFromName } from '../../multisig-tokens';
import { chainFromNetwork } from '../../multisig.utils';

interface AccountsSectionProps {
  vault: Vault;
  accounts: VaultAccountSummary[] | undefined;
  isLoading: boolean;
  isRecovering: boolean;
  recoveryFailed: boolean;
  onRetryRecovery(): void;
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
  const { crypto, fiat } = useVaultAccountBalance(account);
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
      <Pressable
        type="button"
        onClick={onOpen}
        aria-label={`Open ${account.name}`}
        position="absolute"
        inset="0"
        zIndex={0}
        bg="transparent"
        cursor="pointer"
        borderRadius="md"
        _before={{ inset: 0 }}
      />
      <Box position="relative" zIndex={1} pointerEvents="none">
        <ListItemBox
          variant="plain"
          leading={
            <AvatarSq
              chain={chain}
              icon={account.icon ?? 'piggybank'}
              themeId={theme.id}
              size="lg"
            />
          }
          title={<styled.span textStyle="heading.05">{account.name}</styled.span>}
          caption={
            <styled.span display="flex" width="100%" minWidth={0} pointerEvents="auto">
              <CopyAddress addr={account.multisigAddress} wide />
            </styled.span>
          }
          trailing={
            <Balance balance={fiat} formatCurrency={formatCurrency} textStyle="heading.05" />
          }
          trailingCaption={
            <Balance
              balance={crypto}
              formatCurrency={formatCryptoGlanceable}
              textStyle="caption.01"
              color="ink.text-subdued"
            />
          }
        />
      </Box>
    </Box>
  );
}

function CreateAccountTile({
  isFirstAccount,
  onClick,
}: {
  isFirstAccount: boolean;
  onClick(): void;
}) {
  return (
    <Pressable
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
      _before={{ inset: 0 }}
      _hover={{ bg: 'ink.component-background-hover' }}
    >
      <PlusIcon variant="medium" width={20} height={20} color="ink.text-primary" />
      {isFirstAccount ? 'Create your first account' : 'Create new account'}
    </Pressable>
  );
}

function CreateAccountDisabled({ reason }: { reason: string }) {
  return (
    <Box
      width="100%"
      p="space.05"
      borderRadius="md"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
      textAlign="center"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {reason}
      </styled.span>
    </Box>
  );
}

export function AccountsSection({
  vault,
  accounts,
  isLoading,
  isRecovering,
  recoveryFailed,
  onRetryRecovery,
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
      {isRecovering && (
        <Flex
          alignItems="center"
          justifyContent="center"
          height="76px"
          borderRadius="md"
          bg="ink.component-background-default"
          opacity={0.6}
        >
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            Scanning for existing accounts…
          </styled.span>
        </Flex>
      )}
      {!isRecovering && recoveryFailed && (
        <Flex
          alignItems="center"
          justifyContent="space-between"
          gap="space.03"
          p="space.04"
          borderRadius="md"
          borderWidth="1px"
          borderStyle="solid"
          borderColor="red.border"
        >
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            Account recovery failed
          </styled.span>
          <Button variant="outline" size="sm" onClick={onRetryRecovery}>
            Try again
          </Button>
        </Flex>
      )}
      {canCreate && (
        <CreateAccountTile isFirstAccount={accounts?.length === 0} onClick={onCreateAccount} />
      )}
      {!canCreate && disabledReason !== undefined && (
        <CreateAccountDisabled reason={disabledReason} />
      )}
    </Flex>
  );
}
