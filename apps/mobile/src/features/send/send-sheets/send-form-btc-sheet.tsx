import { FormProvider, useForm } from 'react-hook-form';

import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useBitcoinAccountTotalBitcoinBalance } from '@/queries/balance/bitcoin-balance.query';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { BtcAvatarIcon } from '@leather.io/ui/native';

import {
  SendFormBtcSchema,
  defaultSendFormBtcValues,
  sendFormBtcSchema,
} from '../send-form/schemas/send-form-btc.schema';
import { SendForm } from '../send-form/send-form';
import { CreateCurrentSendRoute, useSendSheetNavigation, useSendSheetRoute } from '../utils';

type CurrentRoute = CreateCurrentSendRoute<'send-form-btc'>;
export function SendFormBtcSheet() {
  const { i18n } = useLingui();
  const route = useSendSheetRoute<CurrentRoute>();
  const navigation = useSendSheetNavigation<CurrentRoute>();

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
          <SendForm.Asset
            onPress={() =>
              navigation.navigate('send-select-asset', { account: route.params.account })
            }
            icon={<BtcAvatarIcon />}
            assetName={t({
              id: 'asset_name.bitcoin',
              message: 'Bitcoin',
            })}
            chain={t({
              id: 'asset_name.layer_1',
              message: 'Layer 1',
            })}
          />
          <SendForm.AmountField />
          <SendForm.RecipientField />
          <SendForm.Memo />
          <SendForm.Footer>
            <SendForm.Numpad />
            <SendForm.Button />
          </SendForm.Footer>
        </SendForm>
      </FormProvider>
    </FullHeightSheetLayout>
  );
}
