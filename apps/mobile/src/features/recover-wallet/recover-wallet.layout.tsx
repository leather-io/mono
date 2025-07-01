import { useRef } from 'react';

import { Screen } from '@/components/screen/screen';
import { RecoverWalletSheet } from '@/features/wallet-manager/recover-wallet/recover-wallet-sheet';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';

import {
  Accordion,
  Box,
  Button,
  Cell,
  ChevronRightIcon,
  HasChildren,
  LockIcon,
  SheetRef,
  Text,
} from '@leather.io/ui/native';

interface RecoverWalletLayoutProps extends HasChildren {
  passphrase: string;
  setPassphrase: (passphrase: string) => void;
  onSubmit: () => void;
  isButtonDisabled: boolean;
}

export function RecoverWalletLayout({
  children,
  setPassphrase,
  passphrase,
  onSubmit,
  isButtonDisabled,
}: RecoverWalletLayoutProps) {
  const recoverWalletSheetRef = useRef<SheetRef>(null);

  return (
    <Screen>
      <Screen.Header />
      <Screen.ScrollView>
        <Screen.Title>
          {t({ id: 'recover_wallet.title', message: 'Enter your Secret Key' })}
        </Screen.Title>
        <Box px="5">
          <Box gap="3">
            <Text variant="label01">
              {t({
                id: 'recover_wallet.subtitle',
                message: 'Paste or type Secret Key to add wallet',
              })}
            </Text>
          </Box>
          {children}

          <Accordion
            label={t({
              id: 'recover_wallet.accordion_label',
              message: 'Advanced options',
            })}
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
                    <Cell.Label variant="primary">
                      {t({
                        id: 'recover_wallet.passphrase_label',
                        message: 'BIP39 passphrase',
                      })}
                    </Cell.Label>
                    <Cell.Label variant="primary">
                      {passphrase
                        ? t({
                            id: 'recover_wallet.passphrase_enabled',
                            message: 'Enabled',
                          })
                        : t({
                            id: 'recover_wallet.passphrase_disabled',
                            message: 'Disabled',
                          })}
                    </Cell.Label>
                  </Cell.Content>
                  <Cell.Aside>
                    <ChevronRightIcon variant="small" />
                  </Cell.Aside>
                </Cell.Root>
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
          title={t({
            id: 'recover_wallet.button',
            message: 'Continue',
          })}
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
