import {
  CreateCurrentSendRoute,
  useSendSheetNavigation,
  useSendSheetRoute,
} from '../../send-form.utils';
import { SendFormStxSchema } from '../schemas/send-form-stx.schema';

type CurrentRoute = CreateCurrentSendRoute<'send-form-btc'>;

export function useSendFormBtc() {
  const route = useSendSheetRoute<CurrentRoute>();
  const navigation = useSendSheetNavigation<CurrentRoute>();

  return {
    onGoBack() {
      navigation.navigate('send-select-asset', { account: route.params.account });
    },
    // Temporary logs until we can hook up to approver flow
    async onInitSendTransfer(values: SendFormStxSchema) {
      // eslint-disable-next-line no-console, lingui/no-unlocalized-strings
      console.log('Send form data:', values);
    },
  };
}
