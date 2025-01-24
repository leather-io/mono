import { FullHeightSheetHeader } from '@/components/full-height-sheet/full-height-sheet-header';
import { FullHeightSheetLayout } from '@/components/full-height-sheet/full-height-sheet.layout';
import { BitcoinBalanceByAccount } from '@/features/balances/bitcoin/bitcoin-balance';
import { StacksBalanceByAccount } from '@/features/balances/stacks/stacks-balance';
import { NetworkBadge } from '@/features/settings/network-badge';
import { BitcoinPayerLoader, StacksSignerLoader } from '@/store/keychains/keychains';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { bytesToHex } from '@noble/hashes/utils';

import {
  CreateCurrentSendRoute,
  useSendSheetNavigation,
  useSendSheetRoute,
} from '../send-form/send-form.utils';

type CurrentRoute = CreateCurrentSendRoute<'send-select-asset'>;

export function SelectAssetSheet() {
  const { i18n } = useLingui();
  const {
    params: { account },
  } = useSendSheetRoute<CurrentRoute>();
  const { accountIndex, fingerprint, name } = account;
  const navigation = useSendSheetNavigation<CurrentRoute>();

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
      <BitcoinPayerLoader fingerprint={account.fingerprint} accountIndex={account.accountIndex}>
        {({ nativeSegwitPayer }) => (
          <BitcoinBalanceByAccount
            accountIndex={accountIndex}
            fingerprint={fingerprint}
            onPress={() =>
              navigation.navigate('send-form-btc', {
                account,
                address: nativeSegwitPayer.address,
                publicKey: bytesToHex(nativeSegwitPayer.publicKey),
              })
            }
          />
        )}
      </BitcoinPayerLoader>
      <StacksSignerLoader fingerprint={account.fingerprint} accountIndex={account.accountIndex}>
        {({ stxSigner }) => (
          <StacksBalanceByAccount
            accountIndex={accountIndex}
            fingerprint={fingerprint}
            onPress={() =>
              navigation.navigate('send-form-stx', {
                account,
                address: stxSigner.address,
                publicKey: bytesToHex(stxSigner.publicKey),
              })
            }
          />
        )}
      </StacksSignerLoader>
    </FullHeightSheetLayout>
  );
}
