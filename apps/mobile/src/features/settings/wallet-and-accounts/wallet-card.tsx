import { useState } from 'react';

import { SpinnerIcon } from '@/components/spinner-icon';
import { useToastContext } from '@/components/toast/toast-context';
import { AccountList } from '@/features/account-list/account-list';
import { WalletId } from '@/models/domain.model';
import { AppRoutes } from '@/routes';
import { TestId } from '@/shared/test-id';
import { useAccountsByFingerprint } from '@/store/accounts/accounts.read';
import { useKeyStore } from '@/store/key-store';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import { useRouter } from 'expo-router';

import {
  Box,
  Button,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  SettingsGearIcon,
  Text,
  Theme,
  TouchableOpacity,
} from '@leather.io/ui/native';

import { WalletViewVariant } from './types';

interface WalletCardProps extends WalletId {
  variant: WalletViewVariant;
  name: string;
}
export function WalletCard({ fingerprint, variant, name }: WalletCardProps) {
  const { list: accounts } = useAccountsByFingerprint(fingerprint, variant);
  const [showAccounts, setShowAccounts] = useState(true);
  const theme = useTheme<Theme>();
  const keys = useKeyStore();
  const { displayToast } = useToastContext();
  const router = useRouter();
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  return (
    <Box flexDirection="column">
      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        <TouchableOpacity
          py="3"
          flex={1}
          flexDirection="row"
          alignItems="center"
          gap="1"
          onPress={() => {
            setShowAccounts(!showAccounts);
          }}
        >
          <Text variant="label02">{name}</Text>
          {showAccounts ? (
            <ChevronUpIcon color={theme.colors['ink.text-primary']} variant="small" />
          ) : (
            <ChevronDownIcon color={theme.colors['ink.text-primary']} variant="small" />
          )}
        </TouchableOpacity>
        {variant === 'active' && (
          <TouchableOpacity
            onPress={() => {
              router.navigate({
                pathname: AppRoutes.SettingsWalletConfigureWallet,
                params: { fingerprint },
              });
            }}
            py="3"
            flex={1}
            alignItems="flex-end"
            testID={TestId.walletListSettingsButton}
          >
            <SettingsGearIcon color={theme.colors['ink.text-primary']} />
          </TouchableOpacity>
        )}
      </Box>
      {showAccounts && (
        <Box flexDirection="column" gap="3">
          <AccountList
            accounts={accounts}
            navigateToPath={AppRoutes.SettingsWalletConfigureAccount}
            walletFingerprint={fingerprint}
          />
          {variant === 'active' && (
            <Button
              onPress={async () => {
                setIsAddingAccount(true);
                await keys.createNewAccountOfWallet(fingerprint);
                displayToast({
                  title: t({
                    id: 'wallet.add_account.toast_title',
                    message: `Account created`,
                  }),
                  type: 'success',
                });
                setIsAddingAccount(false);
              }}
              buttonState="ghost"
              disabled={isAddingAccount}
              title={
                isAddingAccount
                  ? t({
                      id: 'wallet.adding_account.button',
                      message: `Adding account`,
                    })
                  : t({
                      id: 'wallet.add_account.button',
                      message: `Add account`,
                    })
              }
              icon={isAddingAccount ? <SpinnerIcon /> : <PlusIcon />}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
