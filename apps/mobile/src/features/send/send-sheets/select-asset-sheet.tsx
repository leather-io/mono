import { ScrollView } from 'react-native-gesture-handler';

import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { BitcoinBalanceByAccount } from '@/features/balances/bitcoin/bitcoin-balance';
import { StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { NetworkBadge } from '@/features/settings/network-badge';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';

import { CreateCurrentSendRoute, useSendSheetNavigation, useSendSheetRoute } from '../utils';

type CurrentRoute = CreateCurrentSendRoute<'send-select-asset'>;

export function SelectAssetSheet() {
  const { i18n } = useLingui();
  const route = useSendSheetRoute<CurrentRoute>();
  const navigation = useSendSheetNavigation<CurrentRoute>();
  const account = route.params.account;
  const { accountIndex, fingerprint, name } = account;

  return (
    <FullHeightSheetLayout
      header={
        <FullHeightSheetHeader
          title={t({
            id: 'select_asset.header_title',
            message: 'Select asset',
          })}
          subtitle={i18n._({
            id: 'select_asset.header_subtitle',
            message: '{subtitle}',
            values: { subtitle: name },
          })}
          rightElement={<NetworkBadge />}
        />
      }
    >
      <ScrollView>
        <BitcoinBalanceByAccount
          accountIndex={accountIndex}
          fingerprint={fingerprint}
          onPress={() => navigation.navigate('send-form-btc', { account })}
        />
        <StacksBalanceByAccount
          accountIndex={accountIndex}
          fingerprint={fingerprint}
          onPress={() => navigation.navigate('send-form-stx', { account })}
        />
      </ScrollView>
    </FullHeightSheetLayout>
  );
}
