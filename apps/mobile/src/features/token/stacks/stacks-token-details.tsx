import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import { useStxAccountBalance, useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { Account } from '@/store/accounts/accounts';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { useStacksSignerAddressFromAccountIndex } from '@/store/keychains/stacks/stacks-keychains.read';
import { WalletStore } from '@/store/wallets/utils';
import { t } from '@lingui/core/macro';

import { stxAsset } from '@leather.io/constants';
import { Box, StxAvatarIcon } from '@leather.io/ui/native';

import { AccountList, TokenDetailsAccountListItem } from '../account-list-item';
import { AddressListItem } from '../address-list';
import { Token } from '../token';

type StacksTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;
export function StacksTokenBalance(props: StacksTokenBalanceProps) {
  return <TokenBalance ticker="STX" icon={<StxAvatarIcon />} tokenName={t`Stacks`} {...props} />;
}

export function StacksTokenDetails() {
  const { state, value } = useStxTotalBalance();

  const availableBalance = value?.stx.availableUnlockedBalance;
  const quoteBalance = value?.quote.availableUnlockedBalance;
  if (!availableBalance || !quoteBalance) {
    return null;
  }
  return (
    <Token
      tokenId={'STX'}
      asset={stxAsset}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      canSend={true}
    >
      <AccountList tokenId={'STX'} />
    </Token>
  );
}

interface StacksTokenDetailsByAccountProps {
  accountIndex: number;
  fingerprint: string;
  onPress?: () => void;
}
export function StacksTokenDetailsByAccount({
  accountIndex,
  fingerprint,
  onPress,
}: StacksTokenDetailsByAccountProps) {
  const { state, value } = useStxAccountBalance(fingerprint, accountIndex);

  const availableBalance = value?.stx.availableUnlockedBalance;
  const quoteBalance = value?.quote.availableUnlockedBalance;
  const account = useAccountByIndex(fingerprint, accountIndex);
  if (!availableBalance || !quoteBalance || !account) {
    return null;
  }

  return (
    <Token
      tokenId="STX"
      asset={stxAsset}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      canSend={true}
    >
      <StacksAccountAddressList account={account} />
    </Token>
  );
}

interface StacksAccountListItemProps {
  account: Account;
  wallet: WalletStore;
  accountIndex: number;
  fingerprint: string;
}
export function StacksAccountListItem({
  account,
  wallet,
  accountIndex,
  fingerprint,
}: StacksAccountListItemProps) {
  const { state, value } = useStxAccountBalance(fingerprint, accountIndex);

  const availableBalance = value?.stx.availableUnlockedBalance;
  const quoteBalance = value?.quote.availableUnlockedBalance;

  if (!availableBalance || !quoteBalance) {
    return null;
  }

  return (
    <TokenDetailsAccountListItem
      account={account}
      wallet={wallet}
      tokenId={'STX'}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
    />
  );
}

export function StacksAccountAddressList({ account }: { account: Account }) {
  const stxAddress = useStacksSignerAddressFromAccountIndex(
    account.fingerprint,
    account.accountIndex
  );
  const stxBalance = useStxAccountBalance(account.fingerprint, account.accountIndex);
  if (!stxAddress || !stxBalance) {
    return null;
  }
  return (
    <Box>
      <AddressListItem
        accountName={account.name}
        address={stxAddress}
        name={t`STX`}
        tokenId="STX"
        availableBalance={stxBalance.value?.stx.availableBalance}
        quoteBalance={stxBalance.value?.quote.availableBalance}
      />
    </Box>
  );
}
