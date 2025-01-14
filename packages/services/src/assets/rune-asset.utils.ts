import {
  CryptoAssetCategories,
  CryptoAssetChains,
  CryptoAssetProtocols,
  RuneCryptoAssetInfo,
} from '@leather.io/models';

const defaultRunesSymbol = '¤';

export function createRuneCryptoAssetInfo(
  runeName: string,
  spacedRuneName: string,
  decimals: number,
  symbol?: string
): RuneCryptoAssetInfo {
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
