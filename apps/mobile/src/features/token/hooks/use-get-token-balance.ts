import { AccountBalance, useAccountBalance } from '@/queries/balance/account-balance.query';
import { TotalBalance, useTotalBalance } from '@/queries/balance/total-balance.query';
import { Account } from '@/store/accounts/accounts';

import { btcAsset, stxAsset } from '@leather.io/constants';
import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { Sip10Balance } from '@leather.io/services';

export interface TokenBalance {
  asset: FungibleCryptoAsset;
  availableBalance: Money;
  quoteBalance: Money;
}

interface UseGetAccountTokenBalanceProps {
  tokenId: string;
  account: Account;
}

export function useGetAccountTokenBalance({ tokenId, account }: UseGetAccountTokenBalanceProps) {
  const accountBalance = useAccountBalance({
    fingerprint: account.fingerprint,
    accountIndex: account.accountIndex,
  });
  return getTokenBalance({ tokenId, balance: accountBalance });
}
interface UseGetTokenBalanceProps {
  tokenId: string;
}
export function useGetTokenBalance({ tokenId }: UseGetTokenBalanceProps) {
  const totalBalance = useTotalBalance();
  return getTokenBalance({ tokenId, balance: totalBalance });
}

interface GetTokenBalanceProps {
  tokenId: string;
  balance: AccountBalance | TotalBalance;
}

function getTokenBalance({ tokenId, balance }: GetTokenBalanceProps) {
  // if (tokenId === 'BTC') {
  //   if (balance.btc.state === 'success') {
  //     return {
  //       asset: btcAsset,
  //       availableBalance: balance.btc.value?.btc.availableBalance,
  //       quoteBalance: balance.btc.value?.quote.availableBalance,
  //     };
  //   }
  // }
  // if (tokenId === 'STX') {
  //   if (balance.stx.state === 'success') {
  //     return {
  //       asset: stxAsset,
  //       availableBalance: balance.stx.value?.stx.availableBalance,
  //       quoteBalance: balance.stx.value?.quote.availableBalance,
  //     };
  //   }
  // }

  if (balance.sip10.state === 'success') {
    const sip10 = balance.sip10.value?.sip10s.find(
      (token: Sip10Balance) => token.asset.symbol === tokenId
    );
    if (sip10) {
      return {
        asset: sip10.asset,
        availableBalance: sip10.crypto.availableBalance,
        quoteBalance: sip10.quote.availableBalance,
      };
    }
  }
  return null;
}
