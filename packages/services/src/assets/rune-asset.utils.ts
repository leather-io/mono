import {
  CryptoAssetCategories,
  CryptoAssetChains,
  CryptoAssetProtocols,
  RuneAsset,
} from '@leather.io/models';

const defaultRunesSymbol = '¤';

export function createRuneAsset(
  runeName: string,
  spacedRuneName: string,
  decimals: number,
  symbol?: string
): RuneAsset {
  return {
    chain: CryptoAssetChains.bitcoin,
    category: CryptoAssetCategories.fungible,
    protocol: CryptoAssetProtocols.rune,
    decimals,
    hasMemo: false,
    runeName,
    spacedRuneName,
    symbol: symbol ?? defaultRunesSymbol,
  };
}
