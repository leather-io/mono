import { FormProvider, useForm } from 'react-hook-form';

import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { NetworkBadge } from '@/components/network-badge';
import { useBitcoinAccountTotalBitcoinBalance } from '@/queries/balance/bitcoin-balance.query';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { RouteProp, useRoute } from '@react-navigation/native';

import { BtcAvatarIcon } from '@leather.io/ui/native';

import { SendFormFooterLayout } from '../send-form/components/send-form-footer.layout';
import {
  SendFormBtcSchema,
  defaultSendFormBtcValues,
  sendFormBtcSchema,
} from '../send-form/schemas/send-form-btc.schema';
import { SendForm } from '../send-form/send-form';
import { SendSheetNavigatorParamList } from '../send-sheet-navigator';

type SendFormRouteProp = RouteProp<SendSheetNavigatorParamList, 'send-form-btc'>;

export function SendFormBtcSheet() {
  const { i18n } = useLingui();
  const route = useRoute<SendFormRouteProp>();

  const formMethods = useForm<SendFormBtcSchema>({
    defaultValues: defaultSendFormBtcValues,
    resolver: zodResolver(sendFormBtcSchema),
  });

  const { availableBalance, fiatBalance } = useBitcoinAccountTotalBitcoinBalance({
    accountIndex: route.params.account.accountIndex,
    fingerprint: route.params.account.fingerprint,
  });

  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t({
            id: 'send_form.header_title',
            message: 'Send',
          })}
          subtitle={i18n._({
            id: 'select_asset.header_subtitle',
            message: '{subtitle}',
            values: { subtitle: route.params.account.name },
          })}
          rightElement={<NetworkBadge />}
        />
      }
    >
      <FormProvider {...formMethods}>
        <SendForm
          symbol="BTC"
          protocol="nativeBtc"
          availableBalance={availableBalance}
          fiatBalance={fiatBalance}
          defaultValues={defaultSendFormBtcValues}
          schema={sendFormBtcSchema}
        >
          <SendForm.Asset icon={<BtcAvatarIcon />} assetName={t`Bitcoin`} chain={t`Layer 1`} />
          <SendForm.AmountField />
          <SendForm.RecipientField />
          <SendForm.Memo />
          <SendFormFooterLayout>
            <SendForm.Numpad />
            <SendForm.Button />
          </SendFormFooterLayout>
        </SendForm>
      </FormProvider>
    </FullHeightSheetLayout>
  );
}
