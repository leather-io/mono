import { type Sip10Asset, createMarketData, createMarketPair } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import {
  getSip10ContractIdFromAssetIdentifier,
  getSip10TokenAmountInQuote,
} from './rpc-stx-transfer-sip10-ft.utils';

const contractId = 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token';
const leoAsset: Sip10Asset = {
  chain: 'stacks',
  category: 'fungible',
  protocol: 'sip10',
  symbol: 'LEO',
  decimals: 6,
  hasMemo: true,
  name: 'Leo',
  canTransfer: true,
  assetId: `${contractId}::leo`,
  contractId,
  imageCanonicalUri: '',
};

describe(getSip10ContractIdFromAssetIdentifier.name, () => {
  test('returns the contract id of an asset identifier', () => {
    expect(getSip10ContractIdFromAssetIdentifier(`${contractId}::leo`)).toEqual(contractId);
  });
});

describe(getSip10TokenAmountInQuote.name, () => {
  test('prices the token base units with the token market data', () => {
    const marketData = createMarketData(createMarketPair('LEO', 'USD'), createMoney(200, 'USD'));

    const result = getSip10TokenAmountInQuote({ amount: 100000000, asset: leoAsset, marketData });

    expect(result?.symbol).toEqual('USD');
    expect(result?.amount.toNumber()).toEqual(20000);
  });

  test('returns undefined for an unpriced token', () => {
    const marketData = createMarketData(createMarketPair('LEO', 'USD'), createMoney(0, 'USD'));

    expect(
      getSip10TokenAmountInQuote({ amount: 100000000, asset: leoAsset, marketData })
    ).toBeUndefined();
  });

  test('returns undefined while the token metadata or market data is missing', () => {
    const marketData = createMarketData(createMarketPair('LEO', 'USD'), createMoney(200, 'USD'));

    expect(getSip10TokenAmountInQuote({ amount: 100000000, marketData })).toBeUndefined();
    expect(getSip10TokenAmountInQuote({ amount: 100000000, asset: leoAsset })).toBeUndefined();
  });

  test('returns undefined when the market pair is for another asset', () => {
    const marketData = createMarketData(createMarketPair('STX', 'USD'), createMoney(50, 'USD'));

    expect(
      getSip10TokenAmountInQuote({ amount: 100000000, asset: leoAsset, marketData })
    ).toBeUndefined();
  });
});
