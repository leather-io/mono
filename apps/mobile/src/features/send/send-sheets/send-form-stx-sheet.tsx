import { FormProvider, useForm } from 'react-hook-form';

import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { NetworkBadge } from '@/components/network-badge';
import { useGetStacksAddresses } from '@/features/balances/stacks/use-get-stacks-addresses';
import { useStxBalance } from '@/queries/balance/stacks-balance.query';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { RouteProp, useRoute } from '@react-navigation/native';

import { StxAvatarIcon } from '@leather.io/ui/native';

import { SendFormFooterLayout } from '../send-form/components/send-form-footer.layout';
import {
  SendFormStxSchema,
  defaultSendFormStxValues,
  sendFormStxSchema,
} from '../send-form/schemas/send-form-stx.schema';
import { SendForm } from '../send-form/send-form';
import { SendSheetNavigatorParamList } from '../send-sheet-navigator';

type SendFormRouteProp = RouteProp<SendSheetNavigatorParamList, 'send-form-stx'>;

export function SendFormStxSheet() {
  const { i18n } = useLingui();
  const route = useRoute<SendFormRouteProp>();

  const formMethods = useForm<SendFormStxSchema>({
    defaultValues: defaultSendFormStxValues,
    resolver: zodResolver(sendFormStxSchema),
  });

  const addresses = useGetStacksAddresses({
    accountIndex: route.params.account.accountIndex,
    fingerprint: route.params.account.fingerprint,
  });
  const { availableBalance, fiatBalance } = useStxBalance(addresses);

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
          <SendForm.Asset icon={<StxAvatarIcon />} assetName={t`Stacks`} chain={t`Layer 1`} />
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
