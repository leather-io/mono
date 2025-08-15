import { AssetType } from '@/features/receive/get-assets';
import { useSip10AccountBalance } from '@/queries/balance/sip10-balance.query';
import { Account } from '@/store/accounts/accounts';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';

import { AddressList, AddressListItem } from '../components/address-list';

interface Sip10AddressListProps {
  account: Account;
  tokenId: string;
}
export function Sip10AddressList({ account, tokenId }: Sip10AddressListProps) {
  const stxAddress = useStacksSignerAddressFromAccountIndex(
    account.fingerprint,
    account.accountIndex
  );
  const sip10Balance = useSip10AccountBalance(account.fingerprint, account.accountIndex);
  // TODO LEA-3125: improve this to not always need to get all SIP-10 data
  const data = sip10Balance.value?.sip10s.find(sip10 => sip10.asset.symbol === tokenId);
  return (
    <AddressList account={account}>
      <AddressListItem
        assetType={AssetType.Stacks}
        address={stxAddress ?? ''}
        name={data?.asset.name ?? ''}
        availableBalance={data?.crypto.availableBalance}
        quoteBalance={data?.quote.availableBalance}
      />
    </AddressList>
  );
}
