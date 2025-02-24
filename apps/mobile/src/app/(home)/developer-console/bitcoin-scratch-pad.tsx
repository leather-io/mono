import { useState } from 'react';
import { TextInput } from 'react-native';

import { usePsbtSigner } from '@/features/psbt-signer/use-psbt-signer';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { BitcoinAccountLoader } from '@/store/keychains/keychains';
import { t } from '@lingui/macro';
import * as btc from '@scure/btc-signer';

import { payerToTapBip32Derivation } from '@leather.io/bitcoin';
import { Box, Button, Text } from '@leather.io/ui/native';

//
// This can be deleted soon, just a place to hang out and test some stuff
export default function BitcoinScratchPad() {
  const { sign } = usePsbtSigner();
  const [text, setText] = useState('bc1qetcn9fdtzq3wez6vrljjyry225ml7j52h3kwgl');

  const { nativeSegwit, taproot } = useBitcoinAccounts().accountIndexByPaymentType('efd01538', 1);

  if (!nativeSegwit || !taproot) throw new Error('No signer found');

  const taprootPayer = taproot.derivePayer({ addressIndex: 0 });

  return (
    <Box p="5">
      <BitcoinAccountLoader fingerprint="efd01538" accountIndex={0}>
        {({ nativeSegwit, taproot }) => (
          <Text fontSize={6} lineHeight={8}>
            {JSON.stringify(
              // TODO: Use `omit` instead.
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              [nativeSegwit, taproot].map(({ keychain, ...rest }) => rest),
              null,
              2
            )}
          </Text>
        )}
      </BitcoinAccountLoader>
      <Text>{t`BitcoinScratchPad`}</Text>

      <Text fontWeight="bold" mt="2">{t`Recipient`}</Text>
      <TextInput
        placeholder={t`Type here to translate!`}
        onChangeText={newText => setText(newText)}
        defaultValue={text}
        autoCapitalize="none"
      />

      <Button
        buttonState="default"
        title={t`Sign`}
        mt="5"
        onPress={async () => {
          const tx = new btc.Transaction();
          tx.addInput({
            txid: 'c5fcf6fc646c33a49e4a0772a351a8ce942e7caf04aafc689eb599ca9c8f57d0',
            index: 0,
            tapInternalKey: taprootPayer.payment.tapInternalKey,
            tapBip32Derivation: [payerToTapBip32Derivation(taprootPayer)],
            witnessUtxo: {
              script: taprootPayer.payment.script,
              amount: 20000n,
            },
          });

          tx.addOutputAddress(
            'bc1pwz9n62p9dhjpqcpdmfcrewdnz3nk8jcved242vd2lj9fgvtvwnwscvdyre',
            19000n
          );

          const signedTx = await sign(tx.toPSBT());

          try {
            signedTx.finalize();
          } catch (e) {
            // eslint-disable-next-line no-console
            console.log('ERROR Finalising', e);
          }

          // eslint-disable-next-line no-console
          console.log('Tx payload', signedTx.hex);
        }}
      />
    </Box>
  );
}
