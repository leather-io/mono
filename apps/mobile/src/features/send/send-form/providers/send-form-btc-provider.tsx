import { t } from '@lingui/macro';

import { AverageBitcoinFeeRates } from '@leather.io/models';
import { Utxo } from '@leather.io/query';
import { HasChildren } from '@leather.io/ui/native';

import { CreateCurrentSendRoute, useSendSheetRoute } from '../../send-form.utils';
import { useSendFormBtc } from '../hooks/use-send-form-btc';
import { SendFormBtcLoader } from '../loaders/send-form-btc-loader';
import { defaultSendFormBtcValues, sendFormBtcSchema } from '../schemas/send-form-btc.schema';
import { SendFormBaseContext } from '../send-form-context';
import { SendFormProvider } from '../send-form-provider';

type CurrentRoute = CreateCurrentSendRoute<'send-form-btc'>;

export interface SendFormBtcContext extends SendFormBaseContext<SendFormBtcContext> {
  feeRates: AverageBitcoinFeeRates;
  utxos: Utxo[];
}

export function SendFormBtcProvider({ children }: HasChildren) {
  const route = useSendSheetRoute<CurrentRoute>();

  const { onInitSendTransfer } = useSendFormBtc();

  return (
    <SendFormBtcLoader account={route.params.account}>
      {({ availableBalance, fiatBalance, feeRates, utxos }) => {
        return (
          <SendFormProvider<SendFormBtcContext>
            initialData={{
              name: t({
                id: 'asset_name.bitcoin',
                message: 'Bitcoin',
              }),
              protocol: 'nativeBtc',
              symbol: 'BTC',
              availableBalance,
              fiatBalance,
              defaultValues: {
                ...defaultSendFormBtcValues,
                feeRate: feeRates.halfHourFee.toString(),
              },
              schema: sendFormBtcSchema,
              feeRates,
              utxos,
              onInitSendTransfer,
            }}
          >
            {children}
          </SendFormProvider>
        );
      }}
    </SendFormBtcLoader>
  );
}
