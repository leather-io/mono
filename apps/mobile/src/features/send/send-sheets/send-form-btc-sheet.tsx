import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { NetworkBadge } from '@/features/settings/network-badge';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { BtcAvatarIcon } from '@leather.io/ui/native';

import { useSendFormBtc } from '../send-form/hooks/use-send-form-btc';
import { SendFormBtcProvider } from '../send-form/providers/send-form-btc-provider';
import { SendForm } from '../send-form/send-form';
import { CreateCurrentSendRoute, useSendSheetRoute } from '../send-form/send-form.utils';

export type CurrentRoute = CreateCurrentSendRoute<'send-form-btc'>;
export function SendFormBtcSheet() {
  const { i18n } = useLingui();
  const {
    params: {
      account: { name: accountName },
    },
  } = useSendSheetRoute<CurrentRoute>();

  const { onGoBack } = useSendFormBtc();

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
            values: { subtitle: accountName },
          })}
          rightElement={<NetworkBadge />}
        />
      }
    >
      <SendFormBtcProvider>
        <SendForm>
          <SendForm.Asset icon={<BtcAvatarIcon />} onPress={onGoBack} />
          <SendForm.AmountField />
          <SendForm.RecipientField />
          <SendForm.Footer>
            <SendForm.Numpad />
            <SendForm.Button />
          </SendForm.Footer>
        </SendForm>
      </SendFormBtcProvider>
    </FullHeightSheetLayout>
  );
}
