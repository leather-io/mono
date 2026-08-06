import { useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useCreateVaultAccount } from '~/features/multisig/vaults/use-vault-account-mutations';
import {
  accountLimitForThreshold,
  isThresholdAtAccountLimit,
} from '~/features/multisig/vaults/vault-account-index';
import { useToast } from '~/features/toasts/use-toast';

import type { Vault, VaultAccountSummary } from '@leather.io/models';
import { getErrorDetail } from '@leather.io/services';
import { Button, CloseIcon, IconButton, Sheet } from '@leather.io/ui';

import { AccountIconNameField } from '../../components/account-icon-name-field';
import { defaultAccountIcon, vaultThemeFromName } from '../../multisig-tokens';
import { chainFromNetwork } from '../../multisig.utils';

interface CreateAccountModalProps {
  vault: Vault;
  accounts: VaultAccountSummary[] | undefined;
  isShowing: boolean;
  onClose(): void;
}

function CreateAccountHeader({ onClose }: { onClose?(): void }) {
  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      gap="space.04"
      px="space.05"
      py="space.04"
      width="100%"
      minHeight="headerHeight"
    >
      <styled.h2 textStyle="heading.05">Create vault account</styled.h2>
      {onClose && <IconButton icon={<CloseIcon />} onClick={onClose} />}
    </Flex>
  );
}

export function CreateAccountModal({
  vault,
  accounts,
  isShowing,
  onClose,
}: CreateAccountModalProps) {
  const { success: showToast } = useToast();
  const createAccount = useCreateVaultAccount(vault.network, vault.id);
  const [name, setName] = useState('');
  const [threshold, setThreshold] = useState<number | null>(null);
  const [icon, setIcon] = useState(defaultAccountIcon);

  const theme = vaultThemeFromName(vault.theme);
  const chain = chainFromNetwork(vault.network);
  const memberCount = vault.members.filter(member => member.membershipStatus === 'joined').length;
  const accountList = accounts ?? [];
  const accountLimit = accountLimitForThreshold(vault.network, memberCount);
  const anyThresholdAtLimit = Array.from(
    { length: memberCount },
    (_unused, index) => index + 1
  ).some(value => isThresholdAtAccountLimit(accountList, value, accountLimit));
  const canSubmit =
    name.trim() !== '' &&
    threshold !== null &&
    !isThresholdAtAccountLimit(accountList, threshold, accountLimit) &&
    !createAccount.isPending;
  const thresholdColumns = Math.min(memberCount, 4);

  function reset() {
    setName('');
    setThreshold(null);
    setIcon(defaultAccountIcon);
    createAccount.reset();
  }

  function handleClose() {
    reset();
    onClose();
  }

  function submit() {
    if (!canSubmit || threshold === null) return;
    createAccount.mutate(
      { name: name.trim(), icon, threshold },
      {
        onSuccess(account) {
          showToast(`Account “${account.name}” created`);
          handleClose();
        },
      }
    );
  }

  return (
    <Sheet
      isShowing={isShowing}
      onClose={handleClose}
      contentMaxVh={90}
      header={<CreateAccountHeader />}
      footer={
        <Flex gap="space.03" justifyContent="flex-end" width="100%">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="solid"
            disabled={!canSubmit}
            aria-busy={createAccount.isPending}
            onClick={submit}
          >
            Create vault account
          </Button>
        </Flex>
      }
    >
      <Flex direction="column" gap="space.05" px="space.05" pb="space.05">
        <styled.p textStyle="body.02" color="ink.text-subdued">
          An account is a shared on-chain address with its own signing threshold. Use multiple
          accounts for different purposes, like treasury, day-to-day DeFi, or ops.
        </styled.p>

        <Box>
          <styled.div textStyle="label.02" color="ink.text-primary" mb="space.02">
            Account name
          </styled.div>
          <AccountIconNameField
            chain={chain}
            themeId={theme.id}
            name={name}
            icon={icon}
            onNameChange={setName}
            onIconChange={setIcon}
            placeholder="Account name"
          />
        </Box>

        <Box>
          <styled.div textStyle="label.02" color="ink.text-primary" mb="space.01">
            Signing threshold
          </styled.div>
          <styled.p textStyle="caption.01" color="ink.text-subdued" mb="space.03">
            How many of {memberCount} members need to approve before a transaction can be broadcast?
          </styled.p>
          <Box
            display="grid"
            gap="space.02"
            style={{ gridTemplateColumns: `repeat(${thresholdColumns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: memberCount }, (_unused, index) => index + 1).map(value => {
              const selected = threshold === value;
              const atLimit = isThresholdAtAccountLimit(accountList, value, accountLimit);
              return (
                <styled.button
                  key={value}
                  type="button"
                  disabled={atLimit}
                  onClick={() => setThreshold(value)}
                  aria-pressed={selected}
                  py="space.04"
                  borderRadius="sm"
                  borderWidth="1px"
                  borderStyle="solid"
                  borderColor={selected ? 'ink.action-primary-default' : 'ink.border-default'}
                  bg={selected ? 'ink.action-primary-default' : 'transparent'}
                  color={selected ? 'ink.background-primary' : 'ink.text-primary'}
                  textStyle="label.01"
                  cursor="pointer"
                  _hover={{ borderColor: 'ink.action-primary-default' }}
                  _disabled={{
                    opacity: 0.4,
                    cursor: 'not-allowed',
                    borderColor: 'ink.border-default',
                  }}
                >
                  {value}
                </styled.button>
              );
            })}
          </Box>
          {anyThresholdAtLimit && (
            <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.02">
              Thresholds at their account limit are disabled.
            </styled.p>
          )}
          {threshold === null ? (
            <styled.p textStyle="caption.01" color="ink.text-subdued" mt="space.03">
              Pick a threshold to continue. Leather doesn't choose this for you.
            </styled.p>
          ) : (
            <Box
              mt="space.03"
              p="space.04"
              borderRadius="md"
              borderWidth="1px"
              borderStyle="solid"
              borderColor="yellow.border"
              bg="yellow.background-primary"
            >
              <styled.p textStyle="caption.01" color="ink.text-subdued">
                Any {threshold} of {memberCount} members will be able to approve transactions.
                {threshold === 1 &&
                  ' A 1-of-1 threshold means any single member can transact alone.'}
              </styled.p>
            </Box>
          )}
        </Box>

        {createAccount.isError && (
          <Box
            p="space.04"
            borderRadius="md"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="red.border"
            bg="red.background-primary"
          >
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              {getErrorDetail(createAccount.error) ?? "Couldn't create this account. Try again."}
            </styled.p>
          </Box>
        )}
      </Flex>
    </Sheet>
  );
}
