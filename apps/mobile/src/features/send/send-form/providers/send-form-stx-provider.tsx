import { t } from '@lingui/macro';

import { Fees } from '@leather.io/models';
import { defaultStacksFees } from '@leather.io/query';
import { HasChildren } from '@leather.io/ui/native';
import { convertAmountToBaseUnit, createMoney } from '@leather.io/utils';

import { CreateCurrentSendRoute, useSendSheetRoute } from '../../send-form.utils';
import { useSendFormStx } from '../hooks/use-send-form-stx';
import { SendFormStxLoader } from '../loaders/send-form-stx-loader';
import { defaultSendFormStxValues, sendFormStxSchema } from '../schemas/send-form-stx.schema';
import { SendFormBaseContext } from '../send-form-context';
import { SendFormProvider } from '../send-form-provider';

const defaultFeeFallback = 2500;

type CurrentRoute = CreateCurrentSendRoute<'send-form-stx'>;

export interface SendFormStxContext extends SendFormBaseContext<SendFormStxContext> {
  fees: Fees;
}

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
        <SendFormProvider<SendFormStxContext>
          initialData={{
            name: t({
              id: 'asset_name.stacks',
              message: 'Stacks',
            }),
            protocol: 'nativeStx',
            symbol: 'STX',
            availableBalance,
            fiatBalance,
            defaultValues: {
              ...defaultSendFormStxValues,
              fee: defaultFee.toString(),
              nonce,
            },
            schema: sendFormStxSchema,
            fees: defaultStacksFees,
            onInitSendTransfer,
          }}
        >
          {children}
        </SendFormProvider>
      )}
    </SendFormStxLoader>
  );
}
