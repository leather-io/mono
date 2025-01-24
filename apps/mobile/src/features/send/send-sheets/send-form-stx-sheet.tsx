import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { NetworkBadge } from '@/features/settings/network-badge';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { StxAvatarIcon } from '@leather.io/ui/native';

import { useSendFormStx } from '../send-form/hooks/use-send-form-stx';
import { SendFormStxProvider } from '../send-form/providers/send-form-stx-provider';
import { SendForm } from '../send-form/send-form';
import { CreateCurrentSendRoute, useSendSheetRoute } from '../send-form/send-form.utils';

type CurrentRoute = CreateCurrentSendRoute<'send-form-stx'>;

export function SendFormStxSheet() {
  const { i18n } = useLingui();
  const {
    params: {
      account: { name: accountName },
    },
  } = useSendSheetRoute<CurrentRoute>();

  const { onGoBack } = useSendFormStx();

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
      <SendFormStxProvider>
        <SendForm>
          <SendForm.Asset icon={<StxAvatarIcon />} onPress={onGoBack} />
          <SendForm.AmountField />
          <SendForm.RecipientField />
          <SendForm.Memo />
          <SendForm.Footer>
            <SendForm.Numpad />
            <SendForm.Button />
          </SendForm.Footer>
        </SendForm>
      </SendFormStxProvider>
    </FullHeightSheetLayout>
  );
}
