import { AssetType } from '@/features/receive/get-assets';
import {
  useBtcAccountNativeSegwitBalance,
  useBtcAccountTaprootBalance,
} from '@/queries/balance/btc-balance.query';
import { Account } from '@/store/accounts/accounts';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { t } from '@lingui/core/macro';

import { AddressList, AddressListItem } from '../components/address-list';

export function BitcoinAddressList({ account }: { account: Account }) {
  const { nativeSegwitPayerAddress, taprootPayerAddress } = useBitcoinPayerAddressFromAccountIndex(
    account.fingerprint,
    account.accountIndex
  );
  const btcTaprootBalance = useBtcAccountTaprootBalance(account.fingerprint, account.accountIndex);
  const btcNativeSegwitBalance = useBtcAccountNativeSegwitBalance(
    account.fingerprint,
    account.accountIndex
  );

  return (
    <AddressList account={account}>
      <AddressListItem
        address={nativeSegwitPayerAddress}
        assetType={AssetType.NativeSegwit}
        name={t`Native Segwit`}
        availableBalance={btcNativeSegwitBalance.value?.btc.availableBalance}
        quoteBalance={btcNativeSegwitBalance.value?.quote.availableBalance}
      />
      <AddressListItem
        address={taprootPayerAddress}
        assetType={AssetType.Taproot}
        name={t`Taproot`}
        availableBalance={btcTaprootBalance.value?.btc.availableBalance}
        quoteBalance={btcTaprootBalance.value?.quote.availableBalance}
      />
    </AddressList>
  );
}
