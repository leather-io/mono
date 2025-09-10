import { useState } from 'react';

import { SpinnerIcon } from '@/components/spinner-icon';
import { useToastContext } from '@/components/toast/toast-context';
import { AccountAddress } from '@/features/account/components/account-address';
import { AccountCard } from '@/features/account/components/account-card';
import { AccountBalance } from '@/features/balances/total-balance';
import { TestId } from '@/shared/test-id';
import { Account } from '@/store/accounts/accounts';
import { useAccountsByFingerprint } from '@/store/accounts/accounts.read';
import { useKeyStore } from '@/store/key-store';
import { useSettings } from '@/store/settings/settings';
import { defaultIconTestId } from '@/utils/testing-utils';
import { t } from '@lingui/core/macro';
import { useRouter } from 'expo-router';

import { WalletId } from '@leather.io/models';
import {
  Box,
  Button,
  ChevronDownIcon,
  ChevronUpIcon,
  IconButton,
  PlusIcon,
  Pressable,
  SettingsGearIcon,
  Text,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';

import { WalletViewVariant } from './types';
import { getIsAccountSelected } from './utils';

interface WalletCardProps extends WalletId {
  variant: WalletViewVariant;
  name: string;
}
export function WalletCard({ fingerprint, variant, name }: WalletCardProps) {
  const { list: accounts } = useAccountsByFingerprint(fingerprint, variant);
  const hasAccounts = accounts.length > 0;
  const [expanded, setExpanded] = useState(true);
  const keys = useKeyStore();
  const { displayToast } = useToastContext();
  const router = useRouter();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const { currentAccount } = useSettings();

  function onSelectAccount(account: Account) {
    router.navigate({
      pathname: '/settings/wallet/configure/[wallet]/[account]',
      params: { fingerprint, wallet: fingerprint, account: account.accountIndex },
    });
  }

  return (
    <Box flexDirection="column" px="5">
      {variant === 'hidden' && !hasAccounts ? null : (
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" py="3">
          <Pressable
            flex={1}
            flexDirection="row"
            alignItems="center"
            gap="1"
            onPress={() => setExpanded(!expanded)}
            pressEffects={legacyTouchablePressEffect}
          >
            <Text variant="label01">{name}</Text>
            {expanded ? (
              <ChevronUpIcon color="ink.text-primary" variant="small" />
            ) : (
              <ChevronDownIcon color="ink.text-primary" variant="small" />
            )}
          </Pressable>
          {variant === 'active' && (
            <IconButton
              icon={<SettingsGearIcon color="ink.text-primary" />}
              label={t`Open wallet settings`}
              onPress={() => {
                router.navigate({
                  pathname: '/settings/wallet/configure/[wallet]',
                  params: { fingerprint, wallet: fingerprint },
                });
              }}
              flex={1}
              alignItems="flex-end"
              testID={TestId.walletListSettingsButton}
              pressEffects={legacyTouchablePressEffect}
            />
          )}
        </Box>
      )}

      {expanded && (
        <Box flexDirection="column" gap="3">
          {accounts.map(account => (
            <AccountCard
              isSelected={getIsAccountSelected(account.id, currentAccount)}
              key={account.id}
              primaryTitle={account.name}
              secondaryTitle={
                <AccountBalance
                  accountIndex={account.accountIndex}
                  fingerprint={account.fingerprint}
                />
              }
              address={
                <AccountAddress
                  accountIndex={account.accountIndex}
                  fingerprint={account.fingerprint}
                />
              }
              icon={account.icon}
              iconTestID={defaultIconTestId(account.icon)}
              onPress={() => onSelectAccount(account)}
              testID={TestId.walletListAccountCard}
            />
          ))}

          {variant === 'active' && (
            <Button
              onPress={async () => {
                try {
                  setIsAddingAccount(true);
                  await keys.createNewAccountOfWallet(fingerprint);
                  displayToast({
                    title: t`Account created`,
                    type: 'success',
                  });
                  setIsAddingAccount(false);
                } catch {
                  displayToast({
                    title: t`Account creation failed`,
                    type: 'error',
                  });
                  setIsAddingAccount(false);
                }
              }}
              variant="ghost"
              disabled={isAddingAccount}
              iconStart={
                isAddingAccount ? () => <SpinnerIcon /> : () => <PlusIcon variant="small" />
              }
            >
              {isAddingAccount ? t`Adding account...` : t`Add account`}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
