import { useEffect, useRef } from 'react';

import { formatAddressesForGetAddresses } from '@/hooks/get-addresses';
import { getDummyKeys } from '@/store/dummy';
import { useSettings } from '@/store/settings/settings.write';
import { t } from '@lingui/macro';

import {
  getNativeSegWitPaymentFromAddressIndex,
  getTaprootPaymentFromAddressIndex,
} from '@leather.io/bitcoin';
import { Box, Button, Sheet, SheetRef } from '@leather.io/ui/native';

import { BrowserMessage } from './browser-in-use';

interface ApproverSheetProps {
  message: BrowserMessage;
  sendResult(result: object): void;
}

export function ApproverSheet(props: ApproverSheetProps) {
  const approverSheetRef = useRef<SheetRef>(null);

  const { theme: themeVariant } = useSettings();
  useEffect(() => {
    if (props.message === null) {
      approverSheetRef.current?.close();
    } else {
      approverSheetRef.current?.present();
    }
  }, [props.message]);

  function approve() {
    const dummyKeys = getDummyKeys();

    const keysToIncludeInResponse = formatAddressesForGetAddresses({
      taproot: {
        address: getTaprootPaymentFromAddressIndex(
          dummyKeys.taprootAccount.keychain.deriveChild(0).deriveChild(0),
          'mainnet'
        ).address as string,
        publicKey: dummyKeys.taprootAccount.keychain.publicKey as Uint8Array,
        derivationPath: dummyKeys.taprootAccount.derivationPath,
      },
      nativeSegwit: {
        address: getNativeSegWitPaymentFromAddressIndex(
          dummyKeys.nativeSegwitAccount.keychain.deriveChild(0).deriveChild(0),
          'mainnet'
        ).address as string,
        publicKey: dummyKeys.nativeSegwitAccount.keychain.publicKey as Uint8Array,
        derivationPath: dummyKeys.nativeSegwitAccount.derivationPath,
      },
      stacksAccountAddress: dummyKeys.stxAddress,
    });

    props.sendResult({ addresses: keysToIncludeInResponse });
  }

  return (
    <Sheet ref={approverSheetRef} themeVariant={themeVariant}>
      <Box p="5">
        <Button title={t`Submit`} buttonState="default" onPress={approve} />
      </Box>
    </Sheet>
  );
}
