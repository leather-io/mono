import { HasChildren } from '@/utils/types';
import { t } from '@lingui/macro';

import { defaultStacksFees } from '@leather.io/query';
import { convertAmountToBaseUnit, createMoney } from '@leather.io/utils';

import { CreateCurrentSendRoute, useSendSheetRoute } from '../../send-form.utils';
import { useSendFormStx } from '../hooks/use-send-form-stx';
import { SendFormStxLoader } from '../loaders/send-form-stx-loader';
import { defaultSendFormStxValues, sendFormStxSchema } from '../schemas/send-form-stx.schema';
import { SendFormProvider } from '../send-form-context';

const defaultFeeFallback = 2500;

type CurrentRoute = CreateCurrentSendRoute<'send-form-stx'>;

export function SendFormStxProvider({ children }: HasChildren) {
  const route = useSendSheetRoute<CurrentRoute>();

  const { onInitSendTransfer } = useSendFormStx();

  const defaultFeeFallbackAsMoney = createMoney(defaultFeeFallback, 'STX');
  const defaultFee = convertAmountToBaseUnit(
    defaultStacksFees.estimates[0]?.fee ?? defaultFeeFallbackAsMoney
  );

  return (
    <SendFormStxLoader account={route.params.account}>
      {({ availableBalance, fiatBalance, nonce }) => (
        <SendFormProvider
          value={{
            name: t({
              id: 'asset_name.stacks',
              message: 'Stacks',
            }),
            protocol: 'nativeStx',
            symbol: 'STX',
            availableBalance,
            fees: {},
            fiatBalance,
            defaultValues: {
              ...defaultSendFormStxValues,
              fee: defaultFee.toString(),
              nonce,
            },
            schema: sendFormStxSchema,
            onInitSendTransfer,
          }}
        >
          {children}
        </SendFormProvider>
      )}
    </SendFormStxLoader>
  );
}
