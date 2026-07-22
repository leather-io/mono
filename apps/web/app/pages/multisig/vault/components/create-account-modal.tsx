import { useEffect, useRef, useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useCreateVaultAccount } from '~/features/multisig/vaults/use-vault-account-mutations';
import {
  accountLimitForThreshold,
  isThresholdAtAccountLimit,
} from '~/features/multisig/vaults/vault-account-index';
import { useToast } from '~/features/toasts/use-toast';

import { ACCOUNT_MAX_NAME_LENGTH } from '@leather.io/constants';
import type { Vault, VaultAccountSummary } from '@leather.io/models';
import { Button, ChevronDownIcon, CloseIcon, IconButton, Sheet } from '@leather.io/ui';

import { AvatarSq } from '../../components/avatar-sq';
import { accountIconUrl, vaultThemeFromName } from '../../multisig-tokens';
import { chainFromNetwork } from '../../multisig.utils';

interface CreateAccountModalProps {
  vault: Vault;
  accounts: VaultAccountSummary[] | undefined;
  isShowing: boolean;
  onClose(): void;
}

const accountIcons = [
  'piggybank',
  'sparkles',
  'orange',
  'saturn',
  'car',
  'alien',
  'space',
  'bank',
  'rocket',
  'folder',
  'smile',
  'code',
  'zap',
  'gift',
  'palette',
  'home',
  'person',
  'inbox',
  'heart',
  'flag',
  'pizza',
];

const defaultAccountIcon = 'piggybank';

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

function GlyphButton({
  icon,
  selected,
  onClick,
}: {
  icon: string;
  selected: boolean;
  onClick(): void;
}) {
  return (
    <styled.button
      type="button"
      onClick={onClick}
      aria-label={icon}
      aria-pressed={selected}
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="100%"
      aspectRatio="1"
      borderRadius="sm"
      borderWidth={selected ? '2px' : '1px'}
      borderStyle="solid"
      borderColor={selected ? 'ink.text-primary' : 'ink.border-default'}
      bg="transparent"
      cursor="pointer"
      _hover={{ borderColor: 'ink.action-primary-default' }}
    >
      <Box
        width="24px"
        height="24px"
        bg="ink.text-primary"
        style={{
          WebkitMaskImage: `url(${accountIconUrl(icon)})`,
          maskImage: `url(${accountIconUrl(icon)})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
        }}
      />
    </styled.button>
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
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPickerOpen) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && pickerRef.current && !pickerRef.current.contains(target)) {
        setIsPickerOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isPickerOpen]);

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
    setIsPickerOpen(false);
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
          <Box position="relative" ref={pickerRef}>
            <Flex
              alignItems="center"
              gap="space.03"
              pl="space.03"
              pr="space.04"
              py="space.03"
              borderRadius="sm"
              borderWidth="1px"
              borderStyle="solid"
              borderColor="ink.border-default"
              bg="ink.background-primary"
            >
              <styled.button
                type="button"
                onClick={() => setIsPickerOpen(open => !open)}
                aria-label="Choose account icon"
                position="relative"
                flexShrink={0}
                lineHeight="0"
                bg="transparent"
                cursor="pointer"
              >
                <AvatarSq
                  chain={chain}
                  icon={icon}
                  themeId={theme.id}
                  size="md"
                  withChainBadge={false}
                />
                <Box
                  position="absolute"
                  bottom="-2px"
                  right="-2px"
                  width="20px"
                  height="20px"
                  borderRadius="round"
                  borderWidth="2px"
                  borderStyle="solid"
                  borderColor="ink.background-primary"
                  bg="ink.text-primary"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Box
                    display="flex"
                    transform={isPickerOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                    transition="transform 150ms ease"
                  >
                    <ChevronDownIcon
                      variant="small"
                      color="ink.background-primary"
                      width={12}
                      height={12}
                    />
                  </Box>
                </Box>
              </styled.button>
              <styled.input
                flex={1}
                value={name}
                placeholder="Account name"
                maxLength={ACCOUNT_MAX_NAME_LENGTH}
                onChange={event => setName(event.target.value)}
                border="none"
                bg="transparent"
                textStyle="body.02"
                _placeholder={{ color: 'ink.text-subdued' }}
                _focusVisible={{ outline: 'none' }}
              />
            </Flex>
            {isPickerOpen && (
              <Box position="absolute" top="100%" left="0" width="100%" mt="space.02" zIndex={20}>
                <Box
                  p="space.03"
                  borderRadius="sm"
                  borderWidth="1px"
                  borderStyle="solid"
                  borderColor="ink.border-default"
                  bg="ink.background-primary"
                  boxShadow="0px 12px 32px rgba(0, 0, 0, 0.16)"
                  display="grid"
                  gridTemplateColumns="repeat(7, 1fr)"
                  gap="space.02"
                >
                  {accountIcons.map(option => (
                    <GlyphButton
                      key={option}
                      icon={option}
                      selected={icon === option}
                      onClick={() => {
                        setIcon(option);
                        setIsPickerOpen(false);
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
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
              Couldn't create this account. Try again.
            </styled.p>
          </Box>
        )}
      </Flex>
    </Sheet>
  );
}
