import { FormProvider, useForm } from 'react-hook-form';

import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { NetworkBadge } from '@/features/settings/network-badge';
import { useStxBalance } from '@/queries/balance/stacks-balance.query';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { StxAvatarIcon } from '@leather.io/ui/native';

import {
  SendFormStxSchema,
  defaultSendFormStxValues,
  sendFormStxSchema,
} from '../send-form/schemas/send-form-stx.schema';
import { SendForm } from '../send-form/send-form';
import { CreateCurrentSendRoute, useSendSheetNavigation, useSendSheetRoute } from '../utils';

type CurrentRoute = CreateCurrentSendRoute<'send-form-stx'>;

export function SendFormStxSheet() {
  const { i18n } = useLingui();
  const route = useSendSheetRoute<CurrentRoute>();
  const navigation = useSendSheetNavigation<CurrentRoute>();
  const formMethods = useForm<SendFormStxSchema>({
    defaultValues: defaultSendFormStxValues,
    resolver: zodResolver(sendFormStxSchema),
  });

  const address = useStacksSignerAddressFromAccountIndex(
    route.params.account.fingerprint,
    route.params.account.accountIndex
  );
  if (!address) {
    throw new Error('Stacks address not found');
  }
  const { availableBalance, fiatBalance } = useStxBalance([address]);

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
          symbol="STX"
          protocol="nativeStx"
          availableBalance={availableBalance}
          fiatBalance={fiatBalance}
          defaultValues={defaultSendFormStxValues}
          schema={sendFormStxSchema}
        >
          <SendForm.Asset
            onPress={() =>
              navigation.navigate('send-select-asset', { account: route.params.account })
            }
            icon={<StxAvatarIcon />}
            assetName={t({
              id: 'asset_name.stacks',
              message: 'Stacks',
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
