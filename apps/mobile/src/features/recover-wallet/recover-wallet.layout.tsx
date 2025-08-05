import { useRef } from 'react';

import { Screen } from '@/components/screen/screen';
import { RecoverWalletSheet } from '@/features/wallet-manager/recover-wallet/recover-wallet-sheet';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/core/macro';

import {
  Accordion,
  Box,
  Button,
  Cell,
  ChevronRightIcon,
  HasChildren,
  LockIcon,
  SheetRef,
  Switch,
  Text,
} from '@leather.io/ui/native';

import { useReadonlyWalletsFlag } from '../feature-flags';

interface RecoverWalletLayoutProps extends HasChildren {
  passphrase: string;
  setPassphrase: (passphrase: string) => void;
  onSubmit(): void;
  isButtonDisabled: boolean;
  onToggleReadonly(): void;
  isReadonly: boolean;
}

export function RecoverWalletLayout({
  children,
  setPassphrase,
  passphrase,
  onSubmit,
  isButtonDisabled,
  onToggleReadonly,
  isReadonly,
}: RecoverWalletLayoutProps) {
  const recoverWalletSheetRef = useRef<SheetRef>(null);
  const isReadonlyWalletsEnabled = useReadonlyWalletsFlag();

  return (
    <Screen>
      <Screen.Header />
      <Screen.ScrollView>
        <Screen.Title>{t`Enter your Secret Key`}</Screen.Title>
        <Box px="5">
          <Box gap="3">
            <Text variant="label01">{t`Paste or type Secret Key to add wallet`}</Text>
          </Box>
          {children}

          <Accordion
            label={t`Advanced options`}
            content={
              <Box mx="-5">
                <Cell.Root
                  pressable
                  onPress={() => {
                    recoverWalletSheetRef.current?.present();
                  }}
                >
                  <Cell.Icon>
                    <Box
                      flexDirection="row"
                      p="3"
                      bg="ink.background-secondary"
                      borderRadius="round"
                    >
                      <LockIcon color="ink.text-primary" />
                    </Box>
                  </Cell.Icon>
                  <Cell.Content>
                    <Cell.Label variant="primary">{t`BIP39 passphrase`}</Cell.Label>
                    <Cell.Label variant="primary">
                      {passphrase ? t`Enabled` : t`Disabled`}
                    </Cell.Label>
                  </Cell.Content>
                  <Cell.Aside>
                    <ChevronRightIcon variant="small" />
                  </Cell.Aside>
                </Cell.Root>
                {isReadonlyWalletsEnabled && (
                  <Cell.Root pressable onPress={onToggleReadonly}>
                    <Cell.Content>
                      <Cell.Label variant="primary">{t`Is Readonly Wallet?`}</Cell.Label>
                    </Cell.Content>
                    <Cell.Aside>
                      <Switch value={isReadonly} onValueChange={onToggleReadonly} />
                    </Cell.Aside>
                  </Cell.Root>
                )}
              </Box>
            }
          />
        </Box>
      </Screen.ScrollView>
      <Screen.Footer>
        <Button
          onPress={onSubmit}
          disabled={isButtonDisabled}
          buttonState={isButtonDisabled ? 'disabled' : 'default'}
          title={t`Continue`}
          testID={TestId.restoreWalletContinue}
        />
      </Screen.Footer>
      <RecoverWalletSheet
        setPassphrase={setPassphrase}
        passphrase={passphrase}
        recoverWalletSheetRef={recoverWalletSheetRef}
      />
    </Screen>
  );
}
