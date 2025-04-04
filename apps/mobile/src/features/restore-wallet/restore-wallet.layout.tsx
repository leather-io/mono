import { useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedHeaderScreenWithKeyboardLayout } from '@/components/headers/animated-header/animated-header-screen-with-keyboard.layout';
import { RestoreWalletSheet } from '@/features/restore-wallet/components/restore-wallet-sheet';
import { TestId } from '@/shared/test-id';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

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
  Theme,
} from '@leather.io/ui/native';

interface RestoreWalletLayoutProps extends HasChildren {
  passphrase: string;
  setPassphrase: (passphrase: string) => void;
  onSubmit: () => void;
  isButtonDisabled: boolean;
}

export function RestoreWalletLayout({
  children,
  setPassphrase,
  passphrase,
  onSubmit,
  isButtonDisabled,
}: RestoreWalletLayoutProps) {
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const restoreWalletSheetRef = useRef<SheetRef>(null);

  return (
    <>
      <Box
        bg="ink.background-primary"
        flex={1}
        style={{ paddingBottom: bottom + theme.spacing[5] }}
      >
        <AnimatedHeaderScreenWithKeyboardLayout
          // hidden until linked: https://linear.app/leather-io/issue/LEA-1916
          // rightTitleElement={<MoreInfoIcon onPress={() => {}} />}
          title={t({ id: 'recover_wallet.title', message: 'Enter your secret key' })}
        >
          <Box gap="3">
            <Text variant="label01" testID={TestId.restoreWalletPassphraseTitle}>
              {t({
                id: 'recover_wallet.subtitle',
                message: 'Paste or type a Secret Key to add its associated wallet.',
              })}
            </Text>
          </Box>
          {children}

          <Accordion
            label={t({
              id: 'recover_wallet.accordion_label',
              message: 'Advanced options',
            })}
            testID={TestId.restoreWalletAdvancedOptionsButton}
            content={
              <Box mx="-5">
                <Cell.Root
                  pressable
                  onPress={() => {
                    restoreWalletSheetRef.current?.present();
                  }}
                  testID={TestId.restoreWalletAdvancedOptionsPassphraseToggle}
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
                    <Cell.Label
                      variant="primary"
                      testID={TestId.restoreWalletAdvancedOptionsPassphraseStatus}
                    >
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
        </AnimatedHeaderScreenWithKeyboardLayout>
        <Button
          mx="5"
          onPress={onSubmit}
          disabled={isButtonDisabled}
          buttonState={isButtonDisabled ? 'disabled' : 'default'}
          title={t({
            id: 'recover_wallet.button',
            message: 'Continue',
          })}
          testID={TestId.restoreWalletContinue}
        />
      </Box>
      <RestoreWalletSheet
        setPassphrase={setPassphrase}
        passphrase={passphrase}
        restoreWalletSheetRef={restoreWalletSheetRef}
      />
    </>
  );
}
