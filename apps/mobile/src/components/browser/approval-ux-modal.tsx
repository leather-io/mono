import { useEffect, useRef } from 'react';

import { formatAddressesForGetAddresses } from '@/hooks/get-addresses';
import { getDummyKeys } from '@/state/dummy';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { t } from '@lingui/macro';

import {
  getNativeSegWitPaymentFromAddressIndex,
  getTaprootPaymentFromAddressIndex,
} from '@leather.io/bitcoin';
import { Box, Button } from '@leather.io/ui/native';

import { Modal } from '../bottom-sheet-modal';
import { BrowserMessage } from './browser-in-use';

interface ApproverModalProps {
  message: BrowserMessage;
  sendResult(result: object): void;
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

    props.sendResult({ addresses: keysToIncludeInResponse });
  }

  return (
    <Modal ref={approverModalRef}>
      <Box p="5">
        <Button title={t`Submit`} buttonState="default" onPress={approve} />
      </Box>
    </Modal>
  );
}
