import { useSheetNavigatorContext } from '@/common/sheet-navigator/sheet-navigator-provider';
import { PsbtSigner } from '@/features/psbt-signer/psbt-signer';

import {
  CreateCurrentSendRoute,
  useSendSheetNavigation,
  useSendSheetRoute,
} from '../send-form/send-form.utils';

type CurrentRoute = CreateCurrentSendRoute<'sign-psbt'>;

export function SendSheetSignPsbt() {
  const {
    params: { psbtHex },
  } = useSendSheetRoute<CurrentRoute>();
  const navigation = useSendSheetNavigation<CurrentRoute>();
  const { sendSheetRef } = useSheetNavigatorContext();

  return (
    <PsbtSigner
      psbtHex={psbtHex}
      onEdit={navigation.goBack}
      onSuccess={() => sendSheetRef.current?.close()}
    />
  );
}
