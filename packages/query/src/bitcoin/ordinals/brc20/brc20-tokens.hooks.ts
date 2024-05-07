import type { Signer } from '@leather-wallet/bitcoin';
import { type Money, createMarketData, createMarketPair } from '@leather-wallet/models';
import {
  useCalculateBitcoinFiatValue,
  useConfigOrdinalsbot,
  useGetBrc20TokensQuery,
  useLeatherNetwork,
} from '@leather-wallet/query';
import { createMoney, unitToFractionalUnit } from '@leather-wallet/utils';
import { P2TROut } from '@scure/btc-signer';
import BigNumber from 'bignumber.js';

import type { Brc20Token } from '../../bitcoin-client';

// ts-unused-exports:disable-next-line
export function useBrc20FeatureFlag() {
  const currentNetwork = useLeatherNetwork();

  const ordinalsbotConfig = useConfigOrdinalsbot();

  if (!ordinalsbotConfig.integrationEnabled) {
    return { enabled: false, reason: 'BRC-20 transfers are temporarily disabled' } as const;
  }

  const supportedNetwork =
    currentNetwork.chain.bitcoin.bitcoinNetwork === 'mainnet' ||
    currentNetwork.chain.bitcoin.bitcoinNetwork === 'signet';

  if (!supportedNetwork) return { enabled: false, reason: 'Unsupported network' } as const;

  // TODO: Add api availability check

  return { enabled: true } as const;
}

function makeBrc20Token(priceAsFiat: Money, token: Brc20Token) {
  return {
    ...token,
    balance: createMoney(
      unitToFractionalUnit(token.tokenData.decimals)(
        new BigNumber(token.tokenData.overall_balance)
      ),
      token.tokenData.ticker,
      token.tokenData.decimals
    ),
    marketData: token.tokenData.min_listed_unit_price
      ? createMarketData(
          // TODO: unsafe `as`
          createMarketPair(token.tokenData.ticker as 'BTC' | 'STX', 'USD'),
          createMoney(priceAsFiat.amount, 'USD')
        )
      : null,
  };
}

export function useBrc20Tokens({
  nativeSegwitAddress,
  createTaprootSigner,
}: {
  nativeSegwitAddress: string;
  createTaprootSigner: ((addressIndex: number) => Signer<P2TROut>) | undefined;
}) {
  const calculateBitcoinFiatValue = useCalculateBitcoinFiatValue();
  const { data: allBrc20TokensResponse } = useGetBrc20TokensQuery({
    nativeSegwitAddress,
    createTaprootSigner,
  });

  const tokens = allBrc20TokensResponse?.pages
    .flatMap(page => page.brc20Tokens)
    .filter(token => token.length > 0)
    .flatMap(token => token);

  return (
    tokens?.map(token => {
      const priceAsFiat = calculateBitcoinFiatValue(
        createMoney(new BigNumber(token.tokenData.min_listed_unit_price ?? 0), 'BTC')
      );
      return makeBrc20Token(priceAsFiat, token);
    }) ?? []
  );
}
