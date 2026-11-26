import { useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { InlineLearnMoreLink } from '~/components/inline-learn-more-link';
import { useAddAccountToWallet } from '~/features/multisig/vaults/use-add-account-to-wallet';
import { useCreateVaultAccount } from '~/features/multisig/vaults/use-vault-account-mutations';
import {
  accountLimitForThreshold,
  isThresholdAtAccountLimit,
  maxAccountsPerThreshold,
} from '~/features/multisig/vaults/vault-account-index';
import { useToast } from '~/features/toasts/use-toast';

import type { Vault, VaultAccount, VaultAccountSummary } from '@leather.io/models';
import { getErrorDetail } from '@leather.io/services';
import {
  BasicTooltip,
  Button,
  Callout,
  InfoCircleIcon,
  Pressable,
  Sheet,
  SheetHeader,
} from '@leather.io/ui';

import { AccountIconNameField } from '../../components/account-icon-name-field';
import { AddToExtensionButton } from '../../components/add-to-extension-button';
import { defaultAccountIcon, vaultThemeFromName } from '../../multisig-tokens';
import { multisigGuides } from '../../multisig.constants';
import { chainFromNetwork } from '../../multisig.utils';
import { AccountRegistrationBody } from './vault-account-setup';

export { AccountRegistrationBody as AccountCreatedStep } from './vault-account-setup';

interface CreateAccountModalProps {
  vault: Vault;
  accounts: VaultAccountSummary[] | undefined;
  isShowing: boolean;
  onClose(): void;
}

function accountLimitExplanation(memberCount: number, limit: number) {
  return `${memberCount} members allow ${limit} accounts per threshold, because a Stacks address is derived from its members and threshold. Members can’t change later, so more accounts means a new vault.`;
}

function fullThresholdExplanation(threshold: number, limit: number) {
  return `Threshold ${threshold} already has its ${limit} ${limit === 1 ? 'account' : 'accounts'}, so you can’t pick it again.`;
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
  const [createdAccount, setCreatedAccount] = useState<VaultAccount | null>(null);
  const { addAccountToWallet, isAddingToWallet } = useAddAccountToWallet(
    vault,
    createdAccount ?? undefined
  );

  const theme = vaultThemeFromName(vault.theme);
  const chain = chainFromNetwork(vault.network);
  const memberCount = vault.members.filter(member => member.membershipStatus === 'joined').length;
  const accountList = accounts ?? [];
  const accountLimit = accountLimitForThreshold(vault.network, memberCount);
  const isLimitFromDerivation = chain === 'stx' && accountLimit < maxAccountsPerThreshold;
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
    setCreatedAccount(null);
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
          setCreatedAccount(account);
        },
      }
    );
  }

  async function addCreatedAccountToWallet() {
    if (await addAccountToWallet()) handleClose();
  }

  const title = createdAccount ? 'Account created' : 'Create vault account';

  return (
    <Sheet
      isShowing={isShowing}
      onClose={handleClose}
      variant={createdAccount ? 'drawer' : 'dialog'}
      contentMaxVh={90}
      title={title}
      description={
        createdAccount
          ? 'Use this vault account with apps through Leather in this browser.'
          : 'Choose an account name and signing threshold.'
      }
      header={<SheetHeader variant="task" title={title} showCloseButton={isAddingToWallet} />}
      footerFade={false}
      footer={
        <Flex gap="space.03" justifyContent="flex-end" width="100%">
          {createdAccount ? (
            <>
              <Button variant="ghost" disabled={isAddingToWallet} onClick={handleClose}>
                Not now
              </Button>
              <AddToExtensionButton
                variant="solid"
                aria-busy={isAddingToWallet}
                disabled={isAddingToWallet}
                onClick={() => void addCreatedAccountToWallet()}
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </Flex>
      }
    >
      {createdAccount ? (
        <AccountRegistrationBody vault={vault} account={createdAccount} />
      ) : (
        <Flex direction="column" gap="space.05" px="space.05" pb="space.05">
          <styled.p textStyle="body.02" color="ink.text-primary">
            An account is a shared on-chain address with its own signing threshold. Use multiple
            accounts for different purposes, like treasury, day-to-day DeFi, or ops.
            <InlineLearnMoreLink
              href={multisigGuides.createAccount}
              subject="creating vault accounts"
            />
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
            <styled.p textStyle="caption.01" color="ink.text-secondary" mb="space.03">
              How many of {memberCount} members need to approve before a transaction can be
              broadcast?
            </styled.p>
            {isLimitFromDerivation && (
              <Box mb="space.03">
                <Callout
                  variant="default"
                  borderRadius="md"
                  icon={<InfoCircleIcon variant="small" color="ink.text-subdued" />}
                >
                  {accountLimitExplanation(memberCount, accountLimit)}
                </Callout>
              </Box>
            )}
            <Box
              display="grid"
              gap="space.02"
              style={{ gridTemplateColumns: `repeat(${thresholdColumns}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: memberCount }, (_unused, index) => index + 1).map(value => {
                const selected = threshold === value;
                const atLimit = isThresholdAtAccountLimit(accountList, value, accountLimit);
                const button = (
                  <Pressable
                    type="button"
                    aria-disabled={atLimit || undefined}
                    data-disabled={atLimit || undefined}
                    onClick={() => {
                      if (!atLimit) setThreshold(value);
                    }}
                    aria-pressed={selected}
                    width="100%"
                    justifyContent="center"
                    py="space.04"
                    borderRadius="sm"
                    borderWidth="1px"
                    borderStyle="solid"
                    borderColor={selected ? 'ink.action-primary-default' : 'ink.border-default'}
                    bg={selected ? 'ink.action-primary-default' : 'transparent'}
                    color={selected ? 'ink.background-primary' : 'ink.text-primary'}
                    textStyle="label.01"
                    cursor="pointer"
                    _before={{ inset: 0 }}
                    _hover={{ borderColor: 'ink.action-primary-default' }}
                    _disabled={{
                      opacity: 0.4,
                      cursor: 'not-allowed',
                      borderColor: 'ink.border-default',
                    }}
                  >
                    {value}
                  </Pressable>
                );

                if (!atLimit) return <Box key={value}>{button}</Box>;

                return (
                  <BasicTooltip
                    key={value}
                    asChild
                    label={fullThresholdExplanation(value, accountLimit)}
                  >
                    {button}
                  </BasicTooltip>
                );
              })}
            </Box>
            {threshold !== null && (
              <Box
                mt="space.03"
                p="space.04"
                borderRadius="md"
                borderWidth="1px"
                borderStyle="solid"
                borderColor="yellow.border"
                bg="yellow.background-primary"
              >
                <styled.p textStyle="caption.01" color="ink.text-secondary">
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
              <styled.p textStyle="caption.01" color="ink.text-secondary">
                {getErrorDetail(createAccount.error) ?? "Couldn't create this account. Try again."}
              </styled.p>
            </Box>
          )}
        </Flex>
      )}
    </Sheet>
  );
}
