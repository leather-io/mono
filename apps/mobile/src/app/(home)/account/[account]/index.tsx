import { useTotalBalance } from '@/hooks/balances/use-total-balance';
import { AccountLoader } from '@/store/accounts/accounts';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { t } from '@lingui/macro';
import { useLocalSearchParams } from 'expo-router';
import { z } from 'zod';

import {
  useCryptoCurrencyMarketDataMeanAverage,
  useStxCryptoAssetBalance,
} from '@leather.io/query';
import { StxAvatarIcon } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { AccountLayout } from './account.layout';

const configureAccountParamsSchema = z.object({
  fingerprint: z.string(),
  account: z.string().transform(value => Number(value)),
});

export default function AccountScreen() {
  const params = useLocalSearchParams();

  const { fingerprint, account: accountIndex } = configureAccountParamsSchema.parse(params);
  const signers = useStacksSigners().fromAccountIndex(fingerprint, accountIndex);

  // Pete - consider fetching this a level above and passing just addresses down here!
  // seems weird that this is an array? [] ask about it. As it will always have 1 entry when going by account index?
  // do I need to create a different selector here?
  const stxAddress = signers[0]?.address;

  const { filteredBalanceQuery } = useStxCryptoAssetBalance(stxAddress || '');
  const stxMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');

  const balance = filteredBalanceQuery.data;
  const stxBalance = balance ? balance.totalBalance : createMoney(0, 'STX');

  const stxUsdAmount = baseCurrencyAmountInQuote(stxBalance, stxMarketData);

  return (
    <AccountLoader fingerprint={fingerprint} accountIndex={accountIndex}>
      {account => (
        <AccountLayout
          balance={stxUsdAmount}
          account={account}
          tokens={[
            {
              chain: t`Stacks blockchain`,
              availableBalance: {
                availableBalance: stxBalance,
              },
              fiatBalance: stxUsdAmount,
              icon: <StxAvatarIcon />,
              ticker: 'stx',
              tokenName: t`Stacks`,
            },
          ]}
        />
      )}
    </AccountLoader>
  );
}
