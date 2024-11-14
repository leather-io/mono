import { HasChildren } from '@/utils/types';
import { t } from '@lingui/macro';

import { CreateCurrentSendRoute, useSendSheetRoute } from '../../send-form.utils';
import { useSendFormBtc } from '../hooks/use-send-form-btc';
import { SendFormBtcLoader } from '../loaders/send-form-btc-loader';
import { defaultSendFormBtcValues, sendFormBtcSchema } from '../schemas/send-form-btc.schema';
import { SendFormProvider } from '../send-form-context';

type CurrentRoute = CreateCurrentSendRoute<'send-form-btc'>;

export function SendFormBtcProvider({ children }: HasChildren) {
  const route = useSendSheetRoute<CurrentRoute>();

  const { onInitSendTransfer } = useSendFormBtc();

  return (
    <SendFormBtcLoader account={route.params.account}>
      {({ availableBalance, fiatBalance, feeRates }) => (
        <SendFormProvider
          value={{
            name: t({
              id: 'asset_name.bitcoin',
              message: 'Bitcoin',
            }),
            protocol: 'nativeBtc',
            symbol: 'BTC',
            availableBalance,
            fees: feeRates,
            fiatBalance,
            defaultValues: defaultSendFormBtcValues,
            schema: sendFormBtcSchema,
            onInitSendTransfer,
          }}
        >
          {children}
        </SendFormProvider>
      )}
    </SendFormBtcLoader>
  );
}
