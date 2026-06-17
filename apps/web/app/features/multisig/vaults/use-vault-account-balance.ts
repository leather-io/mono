import { useQueries, useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { useMarketDataQuery } from '~/queries/market-data/market-data.query';
import { useStxMarketDataQuery } from '~/queries/market-data/stx-market-data.query';
import { useStacksClient } from '~/queries/stacks/stacks-client';
import { useStacksNetwork } from '~/store/stacks-network';

import { btcAsset } from '@leather.io/constants';
import type { AuthNetworkId, Money } from '@leather.io/models';
import { createGetStxAddressBalanceQueryOptions } from '@leather.io/query';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

// V1 multisig is mainnet-pinned (spec §2.2); a single P2WSH address balance is
// read straight from the public mempool.space UTXO endpoint. The descriptor-based
// wallet balance hooks don't accept a bare address.
const mempoolApiUrl = 'https://mempool.space/api';

interface MempoolAddressUtxo {
  value: number;
  status: { confirmed: boolean };
}

interface VaultAccountBalance {
  crypto?: Money;
  fiat?: Money;
}

export function useVaultAccountBalance(
  network: AuthNetworkId,
  address: string | undefined
): VaultAccountBalance {
  const isBtc = network.startsWith('btc');
  const client = useStacksClient();
  const { networkPreference } = useStacksNetwork();
  const stxMarketData = useStxMarketDataQuery();
  const btcMarketData = useMarketDataQuery(btcAsset);

  const stxQuery = useQuery({
    ...createGetStxAddressBalanceQueryOptions({
      address: address ?? '',
      client,
      network: networkPreference.chain.stacks.url,
    }),
    enabled: !isBtc && Boolean(address),
    select: resp => createMoney(new BigNumber(resp.balance), 'STX'),
  });

  const btcQuery = useQuery({
    queryKey: ['multisig-btc-address-balance', address],
    queryFn: async ({ signal }) => {
      const response = await fetch(`${mempoolApiUrl}/address/${address}/utxo`, { signal });
      const utxos: MempoolAddressUtxo[] = await response.json();
      const sats = utxos
        .filter(utxo => utxo.status.confirmed)
        .reduce((total, utxo) => total + utxo.value, 0);
      return createMoney(sats, 'BTC');
    },
    enabled: isBtc && Boolean(address),
  });

  const crypto = isBtc ? btcQuery.data : stxQuery.data;
  const marketData = isBtc ? btcMarketData.data : stxMarketData.data;
  const fiat = crypto && marketData ? baseCurrencyAmountInQuote(crypto, marketData) : undefined;

  return { crypto, fiat };
}

export function useVaultAccountsBalance(
  network: AuthNetworkId,
  addresses: string[]
): VaultAccountBalance {
  const isBtc = network.startsWith('btc');
  const client = useStacksClient();
  const { networkPreference } = useStacksNetwork();
  const stxMarketData = useStxMarketDataQuery();
  const btcMarketData = useMarketDataQuery(btcAsset);

  const stxQueries = useQueries({
    queries: (isBtc ? [] : addresses).map(address =>
      createGetStxAddressBalanceQueryOptions({
        address,
        client,
        network: networkPreference.chain.stacks.url,
      })
    ),
  });

  const btcQueries = useQueries({
    queries: (isBtc ? addresses : []).map(address => ({
      queryKey: ['multisig-btc-address-balance', address],
      queryFn: async () => {
        const response = await fetch(`${mempoolApiUrl}/address/${address}/utxo`);
        const utxos: MempoolAddressUtxo[] = await response.json();
        const sats = utxos
          .filter(utxo => utxo.status.confirmed)
          .reduce((total, utxo) => total + utxo.value, 0);
        return createMoney(sats, 'BTC');
      },
    })),
  });

  const symbol = isBtc ? 'BTC' : 'STX';
  const cryptoBalances: Money[] = [];
  if (isBtc) {
    for (const query of btcQueries) {
      if (query.data) cryptoBalances.push(query.data);
    }
  } else {
    for (const query of stxQueries) {
      if (query.data) cryptoBalances.push(createMoney(new BigNumber(query.data.balance), 'STX'));
    }
  }

  const isLoaded = (isBtc ? btcQueries : stxQueries).every(query => query.isSuccess);
  const totalAmount = cryptoBalances.reduce(
    (total, money) => total.plus(money.amount),
    new BigNumber(0)
  );
  const crypto = isLoaded ? createMoney(totalAmount, symbol) : undefined;
  const marketData = isBtc ? btcMarketData.data : stxMarketData.data;
  const fiat = crypto && marketData ? baseCurrencyAmountInQuote(crypto, marketData) : undefined;

  return { crypto, fiat };
}
