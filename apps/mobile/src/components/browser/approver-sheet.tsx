import { useEffect, useRef } from 'react';

import { formatAddressesForGetAddresses } from '@/hooks/get-addresses';
import { AccountId } from '@/models/domain.model';
import { useBitcoinAccounts } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { useSettings } from '@/store/settings/settings';
import { t } from '@lingui/macro';

import { keyOriginToDerivationPath } from '@leather.io/crypto';
import { Box, Button, Sheet, SheetRef } from '@leather.io/ui/native';

import { BrowserMessage } from './browser-in-use';

interface ApproverSheetProps extends AccountId {
  message: BrowserMessage;
  sendResult(result: object): void;
}
export function ApproverSheet(props: ApproverSheetProps) {
  const { fingerprint, accountIndex, sendResult } = props;

  const { themeDerivedFromThemePreference } = useSettings();
  const approverSheetRef = useRef<SheetRef>(null);

  const stacksAccount = useStacksSigners().fromAccountIndex(fingerprint, accountIndex)[0];
  const { nativeSegwit, taproot } = useBitcoinAccounts().accountIndexByPaymentType(
    fingerprint,
    accountIndex
  );

  const taprootPayer = taproot.derivePayer({ addressIndex: 0 });
  const nativeSegwitPayer = nativeSegwit.derivePayer({ addressIndex: 0 });

  useEffect(() => {
    if (props.message === null) {
      approverSheetRef.current?.close();
    } else {
      approverSheetRef.current?.present();
    }
  }, [props.message]);

  function approve() {
    const keysToIncludeInResponse = formatAddressesForGetAddresses({
      taproot: {
        address: taprootPayer.address,
        publicKey: taprootPayer.publicKey,
        derivationPath: keyOriginToDerivationPath(taprootPayer.keyOrigin),
      },
      nativeSegwit: {
        address: nativeSegwitPayer.address,
        publicKey: nativeSegwitPayer.publicKey,
        derivationPath: keyOriginToDerivationPath(nativeSegwitPayer.keyOrigin),
      },
      stacksAccountAddress: stacksAccount?.address ?? '',
    });

    sendResult({ addresses: keysToIncludeInResponse });
  }

  return (
    <Sheet ref={approverSheetRef} themeVariant={themeDerivedFromThemePreference}>
      <Box p="5">
        <Button title={t`Submit`} buttonState="default" onPress={approve} />
      </Box>
    </Sheet>
  );
}
