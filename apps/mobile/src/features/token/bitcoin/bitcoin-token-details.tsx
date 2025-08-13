import { TokenBalance, TokenBalanceProps } from '@/features/token/components/token-balance';
import {
  useBtcAccountBalance,
  useBtcAccountNativeSegwitBalance,
  useBtcAccountTaprootBalance,
  useBtcTotalBalance,
} from '@/queries/balance/btc-balance.query';
import { Account } from '@/store/accounts/accounts';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { useBitcoinPayerAddressFromAccountIndex } from '@/store/keychains/bitcoin/bitcoin-keychains.read';
import { WalletStore } from '@/store/wallets/utils';
import { t } from '@lingui/core/macro';

import { btcAsset } from '@leather.io/constants';
import { Box, BtcAvatarIcon } from '@leather.io/ui/native';

import { AccountList, TokenDetailsAccountListItem } from '../account-list';
import { AddressList, AddressListItem } from '../address-list';
import { Token } from '../token';

type BitcoinTokenBalanceProps = Omit<TokenBalanceProps, 'ticker' | 'tokenName' | 'icon'>;

export function BitcoinTokenBalance(props: BitcoinTokenBalanceProps) {
  return <TokenBalance ticker="BTC" icon={<BtcAvatarIcon />} tokenName={t`Bitcoin`} {...props} />;
}

export function BitcoinTokenDetails() {
  const { state, value } = useBtcTotalBalance();
  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;
  if (!availableBalance || !quoteBalance) {
    return null;
  }

  return (
    <Token
      tokenId="BTC"
      asset={btcAsset}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      canSend={true}
    >
      <AccountList
        listItem={(account, wallet) => (
          <BitcoinAccountListItem
            account={account}
            wallet={wallet}
            accountIndex={account.accountIndex}
            fingerprint={account.fingerprint}
          />
        )}
      />
    </Token>
  );
}

interface BitcoinTokenDetailsByAccountProps {
  accountIndex: number;
  fingerprint: string;
}
export function BitcoinTokenDetailsByAccount({
  accountIndex,
  fingerprint,
}: BitcoinTokenDetailsByAccountProps) {
  const { state, value } = useBtcAccountBalance(fingerprint, accountIndex);
  const account = useAccountByIndex(fingerprint, accountIndex);
  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;
  if (!availableBalance || !quoteBalance || !account) {
    return null;
  }
  return (
    <Token
      tokenId="BTC"
      asset={btcAsset}
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
      canSend={true}
    >
      <BitcoinAddressList account={account} />
    </Token>
  );
}

interface BitcoinAccountListItemProps {
  account: Account;
  wallet: WalletStore;
  accountIndex: number;
  fingerprint: string;
}
export function BitcoinAccountListItem({
  account,
  wallet,
  accountIndex,
  fingerprint,
}: BitcoinAccountListItemProps) {
  const { state, value } = useBtcAccountBalance(fingerprint, accountIndex);

  const availableBalance = value?.btc.availableBalance;
  const quoteBalance = value?.quote.availableBalance;
  if (!availableBalance || !quoteBalance) {
    return null;
  }
  return (
    <TokenDetailsAccountListItem
      account={account}
      wallet={wallet}
      tokenId="BTC"
      availableBalance={availableBalance}
      quoteBalance={quoteBalance}
    />
  );
}

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
      <Box>
        <AddressListItem
          address={nativeSegwitPayerAddress}
          name={t`Native Segwit`}
          availableBalance={btcNativeSegwitBalance.value?.btc.availableBalance}
          quoteBalance={btcNativeSegwitBalance.value?.quote.availableBalance}
        />
        <AddressListItem
          address={taprootPayerAddress}
          name={t`Taproot`}
          availableBalance={btcTaprootBalance.value?.btc.availableBalance}
          quoteBalance={btcTaprootBalance.value?.quote.availableBalance}
        />
      </Box>
    </AddressList>
  );
}
