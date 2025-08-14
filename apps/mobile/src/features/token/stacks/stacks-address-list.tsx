import { AssetType } from '@/features/receive/get-assets';
import { useStxAccountBalance } from '@/queries/balance/stx-balance.query';
import { Account } from '@/store/accounts/accounts';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { t } from '@lingui/core/macro';

import { Box } from '@leather.io/ui/native';

import { AddressList, AddressListItem } from '../components/address-list';

export function StacksAddressList({ account }: { account: Account }) {
  const stxAddress = useStacksSignerAddressFromAccountIndex(
    account.fingerprint,
    account.accountIndex
  );
  const stxBalance = useStxAccountBalance(account.fingerprint, account.accountIndex);
  if (!stxAddress || !stxBalance) {
    return null;
  }
  return (
    <AddressList account={account}>
      <Box>
        <AddressListItem
          address={stxAddress}
          assetType={AssetType.Stacks}
          name={t`STX`}
          availableBalance={stxBalance.value?.stx.availableBalance}
          quoteBalance={stxBalance.value?.quote.availableBalance}
        />
      </Box>
    </AddressList>
  );
}
