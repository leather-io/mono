import { useState } from 'react';

import { APP_ROUTES } from '@/routes';
import { useAccountsByFingerprint } from '@/state/accounts/accounts.slice';
import { useKeyStore } from '@/state/key-store';
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

import { getAvatarIcon } from '../avatar-icon';
import { useToastContext } from '../toast/toast-context';
import { AccountCard } from './account-card';
import { WalletViewVariant } from './types';

export function WalletCard({
  fingerprint,
  variant,
  name,
}: {
  fingerprint: string;
  variant: WalletViewVariant;
  name: string;
}) {
  const { list: accountsList } = useAccountsByFingerprint(fingerprint, variant);
  const [showAccounts, setShowAccounts] = useState(true);
  const theme = useTheme<Theme>();
  const keys = useKeyStore();
  const { displayToast } = useToastContext();
  const router = useRouter();

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
                pathname: APP_ROUTES.WalletWalletsSettingsConfigureWallet,
                params: { wallet: fingerprint },
              });
            }}
            py="3"
            flex={1}
            alignItems="flex-end"
          >
            <SettingsGearIcon color={theme.colors['ink.text-primary']} />
          </TouchableOpacity>
        )}
      </Box>
      {showAccounts && (
        <Box flexDirection="column" gap="3">
          {accountsList.map(account => {
            return (
              <AccountCard
                Icon={getAvatarIcon(account.icon)}
                name={account.name}
                onPress={() => {
                  router.navigate({
                    pathname: APP_ROUTES.WalletWalletsSettingsConfigureAccount,
                    params: { wallet: fingerprint, account: account.accountIndex },
                  });
                }}
                key={account.id}
              />
            );
          })}
          {variant === 'active' && (
            <Button
              onPress={async () => {
                await keys.createNewAccountOfWallet(fingerprint);
                displayToast({ type: 'success', title: t`Account created` });
              }}
              buttonState="ghost"
              title={t`Add account`}
              icon={<PlusIcon />}
            />
          )}
        </Box>
      )}
    </Box>
  );
}
