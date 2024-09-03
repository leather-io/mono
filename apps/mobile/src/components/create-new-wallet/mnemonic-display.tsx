import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';
import * as Clipboard from 'expo-clipboard';

import { Box, Button, CopyIcon, KeyIcon, Text, Theme } from '@leather.io/ui/native';

import { useToastContext } from '../toast/toast-context';
import { MnemonicWordBox } from './mnemonic-word-box';

function PassphraseDisplay({ passphrase }: { passphrase: string }) {
  return (
    <Box>
      <Text variant="label03" color="ink.text-subdued">{t`BIP39 passphrase`}</Text>
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
  if (!mnemonic) return null;
  const mnemonicWords = mnemonic.split(' ');

  return (
    <Box borderWidth={1} borderColor="ink.border-default" borderRadius="xs" p="3">
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
            displayToast({ title: t`Successfully copied to clipboard!`, type: 'success' });
          }}
          icon={<CopyIcon />}
          flex={1}
          style={{ borderColor: theme.colors['ink.border-default'] }}
          buttonState="outline"
          title={t`Copy`}
        />
        <Button
          onPress={async () => {
            // TODO: add Save to functionality
          }}
          icon={<KeyIcon />}
          flex={1}
          style={{ borderColor: theme.colors['ink.border-default'] }}
          buttonState="outline"
          title={t`Save to...`}
        />
      </Box>
    </Box>
  );
}
