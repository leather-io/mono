import { TokenIcon } from '@/components/widgets/tokens/token-icon';
import {
  useSip10AggregateBalanceQuery,
  useSip10BalancesQuery,
} from '@/queries/balance/sip10-balance.query';
import {
  useStacksSignerAddressFromAccountIndex,
  useStacksSignerAddresses,
} from '@/store/keychains/stacks/stacks-keychains.read';

import { Money } from '@leather.io/models';
import { PressableProps } from '@leather.io/ui/native';
import { sumMoney } from '@leather.io/utils';

import { TokenBalance } from '../token-balance';

interface Sip10TokenBalanceProps extends PressableProps {
  availableBalance: Money;
  fiatBalance: Money;
  symbol: string;
  name: string;
}
export function Sip10TokenBalance({
  availableBalance,
  fiatBalance,
  name,
  symbol,
  ...rest
}: Sip10TokenBalanceProps) {
  return (
    <TokenBalance
      ticker={symbol}
      icon={<TokenIcon ticker={symbol} />} // TODO LEA-1909: add images from uri
      tokenName={name}
      protocol="sip10"
      fiatBalance={fiatBalance}
      availableBalance={availableBalance}
      {...rest}
    />
  );
}

export function Sip10Balance() {
  const addresses = useStacksSignerAddresses();
  const { isFetching, data } = useSip10AggregateBalanceQuery(addresses);

  if (isFetching) {
    return null;
  }
  //   this 'works' on home now but only lists values of the first wallet added
  // it's not an aggregate of all wallets
  // data?.usd.totalBalance.amount is updating properly for multiple wallets

  //   console.log(
  //     'Sip10Balance',
  //     data?.balances.map(balances =>
  //       balances.balances.reduce(
  //         (acc, balance) => {
  //           const existingBalance = acc.find(b => b.symbol === balance.info.symbol);
  //           if (existingBalance) {
  //             existingBalance.availableBalance = sumMoney([
  //               existingBalance.availableBalance,
  //               balance.sip10.availableBalance,
  //             ]);
  //             existingBalance.fiatBalance = sumMoney([
  //               existingBalance.fiatBalance,
  //               balance.usd.totalBalance,
  //             ]);
  //             return acc;
  //           }
  //           return [
  //             ...acc,
  //             {
  //               symbol: balance.info.symbol,
  //               name: balance.info.name,
  //               availableBalance: balance.sip10.availableBalance,
  //               fiatBalance: balance.usd.totalBalance,
  //             },
  //           ];
  //         },
  //         [] as Array<{
  //           symbol: string;
  //           name: string;
  //           availableBalance: Money;
  //           fiatBalance: Money;
  //         }>
  //       )
  //     )
  //   );

  //   Pete - thought this was working but it's not

  //   find a good way to aggregate the balances and its done

  const aggregateBalances = data?.balances.map(balances => {
    // this always logs twice as I am mapping balances obviouslt :(

    // find a way to flatten data?.balances.balances and sum the same values

    // console.log(
    //   new Date().toISOString(),
    //   'balances',
    //   balances.balances.map(b => ({
    //     info: b.info,
    //     sip10: b.sip10.availableBalance,
    //     usd: b.usd.totalBalance,
    //   }))
    // );
    return balances.balances.reduce(
      (acc, balance) => {
        const existingBalance = acc.find(b => b.symbol === balance.info.symbol);
        if (existingBalance) {
          existingBalance.availableBalance = sumMoney([
            existingBalance.availableBalance,
            balance.sip10.availableBalance,
          ]);
          existingBalance.fiatBalance = sumMoney([
            existingBalance.fiatBalance,
            balance.usd.totalBalance,
          ]);
          return acc;
        }
        return [
          ...acc,
          {
            symbol: balance.info.symbol,
            name: balance.info.name,
            availableBalance: balance.sip10.availableBalance,
            fiatBalance: balance.usd.totalBalance,
          },
        ];
      },
      [] as {
        symbol: string;
        name: string;
        availableBalance: Money;
        fiatBalance: Money;
      }[]
    );
  });

  return aggregateBalances?.map(balance =>
    balance.map((balance, index) => (
      <Sip10TokenBalance
        key={`${balance.symbol}-${index}`}
        symbol={balance.symbol}
        name={balance.name}
        availableBalance={balance.availableBalance}
        fiatBalance={balance.fiatBalance}
        px="5"
        py="3"
      />
    ))
  );

  //   const mockBalances = [
  //     {
  //       address: 'a',
  //       balances: [
  //         { info: { name: 'pete', symbol: 'pp' }, sip10: { amount: 22 }, usd: { amount: 22 } },
  //         { info: { name: 'dd', symbol: 'dd' }, sip10: { amount: 22 }, usd: { amount: 22 } },
  //       ],
  //     },
  //     {
  //       address: 'b',
  //       balances: [
  //         { info: { name: 'dd', symbol: 'dd' }, sip10: { amount: 22 }, usd: { amount: 22 } },
  //       ],
  //     },
  //   ];
  //   // PETE this could be it!!! try use this tomorrow

  //   // >?
  //   // Get total sip10 amount by symbol
  //   const totalsBySymbol = mockBalances.reduce(
  //     (acc, addressBalance) => {
  //       addressBalance.balances.forEach(balance => {
  //         const symbol = balance.info.symbol;
  //         if (!acc[symbol]) {
  //           acc[symbol] = 0;
  //         }
  //         acc[symbol] += balance.sip10.amount;
  //       });
  //       return acc;
  //     },
  //     {} as Record<string, number>
  //   );

  // Result:
  // {
  //   pp: 22,  // From address 'a'
  //   dd: 44   // 22 from address 'a' + 22 from address 'b'
  // }

  //   return data?.balances.map(balances =>
  //     balances.balances.map((balance, index) => (
  //       <Sip10TokenBalance
  //         key={`${balance.info.symbol}-${index}`}
  //         symbol={balance.info.symbol}
  //         name={balance.info.name}
  //         availableBalance={balance.sip10.availableBalance}
  //         fiatBalance={balance.usd.totalBalance}
  //         px="5"
  //         py="3"
  //       />
  //     ))
  //   );
}

interface Sip10BalanceByAccountProps {
  accountIndex: number;
  fingerprint: string;
}
export function Sip10BalanceByAccount({ accountIndex, fingerprint }: Sip10BalanceByAccountProps) {
  const address = useStacksSignerAddressFromAccountIndex(fingerprint, accountIndex);
  if (!address) {
    throw new Error('Stacks address not found');
  }
  const { isFetching, data } = useSip10BalancesQuery(address);
  if (isFetching) {
    return null;
  }
  return data?.balances.map((balance, index) => (
    <Sip10TokenBalance
      key={`${balance.info.symbol}-${index}`}
      symbol={balance.info.symbol}
      name={balance.info.name}
      availableBalance={balance.sip10.availableBalance}
      fiatBalance={balance.usd.totalBalance}
      px="5"
      py="3"
    />
  ));
}
