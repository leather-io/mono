import { useSheetNavigatorContext } from '@/common/sheet-navigator/sheet-navigator-provider';
import { PsbtSigner } from '@/features/psbt-signer/psbt-signer';

import {
  CreateCurrentSendRoute,
  useSendSheetNavigation,
  useSendSheetRoute,
} from '../send-form.utils';

type CurrentRoute = CreateCurrentSendRoute<'sign-psbt'>;

export function SendSheetSignPsbt() {
  const route = useSendSheetRoute<CurrentRoute>();
  const navigation = useSendSheetNavigation<CurrentRoute>();
  const { sendSheetRef } = useSheetNavigatorContext();

  const { psbtHex } = route.params;

  return (
    <PsbtSigner
      broadcast
      psbtHex={psbtHex}
      onBack={navigation.goBack}
      onSuccess={() => sendSheetRef.current?.close()}
    />
  );
}
