import { FetchState } from '@/components/loading';
import {
  useSip10AccountBalance,
  useSip10TotalBalance,
} from '@/queries/balance/sip10-balance.query';
import { Account } from '@/store/accounts/accounts';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { WalletStore } from '@/store/wallets/utils';

import { Sip10AddressBalance, Sip10AggregateBalance, Sip10Balance } from '@leather.io/services';
import { Box } from '@leather.io/ui/native';

import { AccountList, TokenDetailsAccountListItem } from '../account-list';
import { AddressList, AddressListItem } from '../address-list';
import { Token } from '../token';

interface Sip10TokenDetailsWrapperProps {
  children: React.ReactNode;
  data: FetchState<Sip10AggregateBalance | Sip10AddressBalance>;
  tokenId: string;
}
function Sip10TokenDetailsWrapper({ data, tokenId, children }: Sip10TokenDetailsWrapperProps) {
  if (data.state !== 'success') {
    return null;
  }
  const sip10 = data?.value?.sip10s.find((token: Sip10Balance) => token.asset.symbol === tokenId);
  const availableBalance = sip10?.crypto.availableBalance;
  const quoteBalance = sip10?.quote.totalBalance;
  const asset = sip10?.asset;
  if (!availableBalance || !quoteBalance || !asset) {
    return null;
  }
  return (
    <Token
      tokenId={tokenId}
      asset={asset}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      canSend={true}
    >
      {children}
    </Token>
  );
}
interface Sip10TokenDetailsProps {
  tokenId: string;
}
export function Sip10TokenDetails({ tokenId }: Sip10TokenDetailsProps) {
  const data = useSip10TotalBalance();

  return (
    <Sip10TokenDetailsWrapper data={data} tokenId={tokenId}>
      <AccountList
        listItem={(account, wallet) => (
          <Sip10AccountListItem
            account={account}
            wallet={wallet}
            accountIndex={account.accountIndex}
            fingerprint={account.fingerprint}
            tokenId={tokenId}
          />
        )}
      />
    </Sip10TokenDetailsWrapper>
  );
}

interface Sip10TokenDetailsByAccountProps {
  accountIndex: number;
  fingerprint: string;
  tokenId: string;
}
export function Sip10TokenDetailsByAccount({
  tokenId,
  accountIndex,
  fingerprint,
}: Sip10TokenDetailsByAccountProps) {
  const data = useSip10AccountBalance(fingerprint, accountIndex);
  const account = useAccountByIndex(fingerprint, accountIndex);
  if (!account) {
    return null;
  }
  return (
    <Sip10TokenDetailsWrapper data={data} tokenId={tokenId}>
      <Sip10AddressList account={account} tokenId={tokenId} />
    </Sip10TokenDetailsWrapper>
  );
}

interface Sip10AccountListItemProps {
  account: Account;
  wallet: WalletStore;
  accountIndex: number;
  fingerprint: string;
  tokenId: string;
}
export function Sip10AccountListItem({
  account,
  wallet,
  tokenId,
  accountIndex,
  fingerprint,
}: Sip10AccountListItemProps) {
  const data = useSip10AccountBalance(fingerprint, accountIndex);
  const availableBalance = data.value?.sip10s.find(
    (token: Sip10Balance) => token.asset.symbol === tokenId
  )?.crypto.availableBalance;
  const quoteBalance = data.value?.sip10s.find(
    (token: Sip10Balance) => token.asset.symbol === tokenId
  )?.quote.totalBalance;

  if (!availableBalance || !quoteBalance) {
    return null;
  }
  return (
    <TokenDetailsAccountListItem
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      account={account}
      wallet={wallet}
      tokenId={tokenId}
    />
  );
}

interface Sip10AddressListProps {
  account: Account;
  tokenId: string;
}
export function Sip10AddressList({ account, tokenId }: Sip10AddressListProps) {
  const stxAddress = useStacksSignerAddressFromAccountIndex(
    account.fingerprint,
    account.accountIndex
  );
  const sip10Balances = useSip10AccountBalance(account.fingerprint, account.accountIndex);
  const sip10Balance = sip10Balances.value?.sip10s.find(sip10 => sip10.asset.symbol === tokenId);
  return (
    <AddressList account={account}>
      <Box>
        <AddressListItem
          address={stxAddress ?? ''}
          name={sip10Balance?.asset.name ?? ''}
          availableBalance={sip10Balance?.crypto.availableBalance}
          quoteBalance={sip10Balance?.quote.availableBalance}
        />
      </Box>
    </AddressList>
  );
}
