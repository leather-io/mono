import { useState } from 'react';

import { SpinnerIcon } from '@/components/spinner-icon';
import { useToastContext } from '@/components/toast/toast-context';
import { AccountAddress } from '@/features/account/components/account-address';
import { AccountCard } from '@/features/account/components/account-card';
import { AccountBalance } from '@/features/balances/total-balance';
import { TestId } from '@/shared/test-id';
import { Account } from '@/store/accounts/accounts';
import { useAccountsByFingerprint } from '@/store/accounts/accounts.read';
import { KeychainCreationType, useKeyStore } from '@/store/key-store';
import { useReadonlyWalletFingerprints } from '@/store/wallets/wallets.read';
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

interface WalletCardProps extends WalletId {
  variant: WalletViewVariant;
  name: string;
  isReadonly?: boolean;
}
export function WalletCard({ fingerprint, variant, name, isReadonly }: WalletCardProps) {
  const { list: accounts } = useAccountsByFingerprint(fingerprint, variant);
  const readonlyWalletFingerprints = useReadonlyWalletFingerprints();
  const isReadonlyWallet = readonlyWalletFingerprints.includes(fingerprint);
  const hasAccounts = accounts.length > 0;
  const [expanded, setExpanded] = useState(true);
  const keys = useKeyStore();
  const { displayToast } = useToastContext();
  const router = useRouter();
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  function onSelectAccount(account: Account) {
    router.navigate({
      pathname: '/settings/wallet/configure/[wallet]/[account]',
      params: { fingerprint, wallet: fingerprint, account: account.accountIndex },
    });
  }

  function addAccount(
    params:
      | {
          isReadonly: false;
        }
      | { isReadonly: true; type: KeychainCreationType }
  ) {
    return async () => {
      try {
        setIsAddingAccount(true);
        if (params.isReadonly) {
          await keys.createNewReadonlyAccountOfWallet(fingerprint, params.type);
        } else {
          await keys.createNewAccountOfWallet(fingerprint);
        }

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
    };
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
            <Text variant="label01">{isReadonly ? t`${name} (read-only)` : name}</Text>
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
            <>
              {!isReadonlyWallet && (
                <Button
                  onPress={addAccount({ isReadonly: false })}
                  buttonState="ghost"
                  disabled={isAddingAccount}
                  title={isAddingAccount ? t`Adding account...` : t`Add account`}
                  icon={isAddingAccount ? <SpinnerIcon /> : <PlusIcon variant="small" />}
                />
              )}
              {isReadonlyWallet && (
                <Box flexDirection="row">
                  <Button
                    onPress={addAccount({ isReadonly: true, type: 'stx-only' })}
                    buttonState="ghost"
                    disabled={isAddingAccount}
                    title={isAddingAccount ? t`Adding account...` : t`Add STX account`}
                    icon={isAddingAccount ? <SpinnerIcon /> : <PlusIcon variant="small" />}
                  />
                  <Button
                    onPress={addAccount({ isReadonly: true, type: 'btc-only' })}
                    buttonState="ghost"
                    disabled={isAddingAccount}
                    title={isAddingAccount ? t`Adding account...` : t`Add BTC account`}
                    icon={isAddingAccount ? <SpinnerIcon /> : <PlusIcon variant="small" />}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
