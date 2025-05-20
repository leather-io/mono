import { useRef } from 'react';

import { NotifyUserSheetLayout } from '@/components/sheets/notify-user-sheet.layout';
import { useToastContext } from '@/components/toast/toast-context';
import { useWaitlistFlag } from '@/features/feature-flags';
import { WaitlistIds } from '@/features/waitlist/ids';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import * as Clipboard from 'expo-clipboard';

import { Box, Button, SheetRef, Text, Theme } from '@leather.io/ui/native';

import { MnemonicWordBox } from './mnemonic-word-box';

function PassphraseDisplay({ passphrase }: { passphrase: string }) {
  return (
    <Box>
      <Text variant="label03" color="ink.text-subdued">
        {t({
          id: 'create_new_wallet.mnemonic.title',
          message: `BIP39 passphrase`,
        })}
      </Text>
      <Text variant="label02">{passphrase}</Text>
    </Box>
  );
}

export function MnemonicDisplay({
  mnemonic,
  passphrase,
}: {
  mnemonic: string | null;
  passphrase?: string | null;
}) {
  const { displayToast } = useToastContext();
  const theme = useTheme<Theme>();
  const notifySheetRef = useRef<SheetRef>(null);
  const releaseWaitlistFeatures = useWaitlistFlag();
  if (!mnemonic) return null;
  const mnemonicWords = mnemonic.split(' ');

  return (
    <>
      <Box p="3">
        <Box pb="2" flexDirection="row" flexWrap="wrap" gap="2">
          {mnemonicWords.map((word, idx) => (
            <MnemonicWordBox key={word + idx} wordIdx={idx + 1} word={word} />
          ))}
        </Box>
        {passphrase && <PassphraseDisplay passphrase={passphrase} />}
        <Box pt="4" gap="2" flexDirection="row" justifyContent="space-between">
          <Button
            onPress={async () => {
              await Clipboard.setStringAsync(mnemonic);
              displayToast({
                title: t({
                  id: 'create_new_wallet.mnemonic.toast_title',
                  message: `Successfully copied to clipboard!`,
                }),
                type: 'success',
              });
            }}
            flex={1}
            style={{ borderColor: theme.colors['ink.text-primary'] }}
            buttonState="outline"
            title={t({
              id: 'create_new_wallet.mnemonic.copy_button',
              message: `Copy`,
            })}
          />
          {releaseWaitlistFeatures && (
            <Button
              onPress={() => notifySheetRef.current?.present()}
              flex={1}
              style={{ borderColor: theme.colors['ink.text-primary'] }}
              buttonState="outline"
              title={t({
                id: 'create_new_wallet.mnemonic.save_button',
                message: `Save to…`,
              })}
            />
          )}
        </Box>
      </Box>

      <NotifyUserSheetLayout
        sheetData={{
          title: t({
            id: 'create_new_wallet.mnemonic.save_button.waitlist_title',
            message: 'Save to…',
          }),
          id: WaitlistIds.saveMnemonic,
        }}
        sheetRef={notifySheetRef}
      />
    </>
  );
}
