import { AssetType } from '@/features/receive/get-assets';
import { useSip10BalanceByAssetId } from '@/queries/balance/sip10-balance.query';
import { Account } from '@/store/accounts/accounts';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';

import { AddressList, AddressListItem } from '../components/address-list';

interface Sip10AddressListProps {
  account: Account;
  assetId: string;
}
export function Sip10AddressList({ account, assetId }: Sip10AddressListProps) {
  const stxAddress = useStacksSignerAddressFromAccountIndex(
    account.fingerprint,
    account.accountIndex
  );
  const balance = useSip10BalanceByAssetId(account.fingerprint, account.accountIndex, assetId);
  return (
    <AddressList account={account}>
      <AddressListItem
        assetType={AssetType.Stacks}
        address={stxAddress ?? ''}
        name={balance.value?.asset.name ?? ''}
        availableBalance={balance.value?.crypto.availableBalance}
        quoteBalance={balance.value?.quote.availableBalance}
      />
    </AddressList>
  );
}
