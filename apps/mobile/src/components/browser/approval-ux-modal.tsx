import { Ref, useEffect, useRef } from 'react';
import WebView from 'react-native-webview';

import { formatAddressesForGetAddresses } from '@/hooks/get-addresses';
import { getDummyKeys } from '@/state/dummy';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import {
  getNativeSegWitPaymentFromAddressIndex,
  getTaprootPaymentFromAddressIndex,
} from '@leather.io/bitcoin';
import { Box, Button } from '@leather.io/ui/native';

import { Modal } from '../bottom-sheet-modal';
import { BrowserMessage } from './browser-in-use';

interface ApproverModalProps {
  webViewRef: Ref<WebView>;
  message: BrowserMessage;
  setMessage(newMessage: BrowserMessage): void;
}

export function ApproverModal(props: ApproverModalProps) {
  const approverModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (props.message === null) {
      approverModalRef.current?.close();
    } else {
      approverModalRef.current?.present();
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

    if (typeof props.webViewRef === 'object') {
      props.webViewRef?.current?.postMessage(
        JSON.stringify({
          id: props.message?.id,
          result: { addresses: keysToIncludeInResponse },
        })
      );
      props.setMessage(null);
    }
  }

  return (
    <Modal ref={approverModalRef}>
      <Box p="5">
        <Button variant="solid" label="submit" onPress={approve} />
      </Box>
    </Modal>
  );
}
