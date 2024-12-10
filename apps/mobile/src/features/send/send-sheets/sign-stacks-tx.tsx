import { useSheetNavigatorContext } from '@/common/sheet-navigator/sheet-navigator-provider';
import { StacksTxSigner } from '@/features/stacks-tx-signer/stacks-tx-signer';

import {
  CreateCurrentSendRoute,
  useSendSheetNavigation,
  useSendSheetRoute,
} from '../send-form.utils';

type CurrentRoute = CreateCurrentSendRoute<'sign-stacks-tx'>;

export function SendSheetSignStacksTx() {
  const route = useSendSheetRoute<CurrentRoute>();
  const navigation = useSendSheetNavigation<CurrentRoute>();
  const { sendSheetRef } = useSheetNavigatorContext();

  const { txHex, accountId } = route.params;

  return (
    <StacksTxSigner
      txHex={txHex}
      onEdit={navigation.goBack}
      onSuccess={() => sendSheetRef.current?.close()}
      accountId={accountId}
    />
  );
}
