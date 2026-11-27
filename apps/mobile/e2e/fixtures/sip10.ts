export const sbtcPrincipal = 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token';
export const sbtcAssetId = `${sbtcPrincipal}::sbtc-token`;
const usdcxPrincipal = 'SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx';
export const usdcxAssetId = `${usdcxPrincipal}::usdcx-token`;
export const aeusdcPrincipal = 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc';
export const longcoinPrincipal = 'SP265WBWD4NH7TVPYQTVD23X3607NNK4484DTXQZ3.longcoin';
export const lttPrincipal = 'SP000000000000000000002Q6VF78.leather-integration-tests';

interface Sip10Token {
  assetIdentifier: string;
  name: string;
  symbol: string;
  decimals: number;
  image: string;
  principal: string;
}

export const sip10Tokens: Record<string, Sip10Token> = {
  [longcoinPrincipal]: {
    assetIdentifier: `${longcoinPrincipal}::longcoin`,
    name: 'LONGcoin',
    symbol: 'LONG',
    decimals: 6,
    image: 'https://storage.googleapis.com/longcoin/LONGcoin-image.png',
    principal: longcoinPrincipal,
  },
  [lttPrincipal]: {
    assetIdentifier: `${lttPrincipal}::leather-test-token`,
    name: 'Leather test token',
    symbol: 'LTT',
    decimals: 6,
    image:
      'https://images.leather.io/tokens/SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-lqstx.svg',
    principal: lttPrincipal,
  },
  [sbtcPrincipal]: {
    assetIdentifier: sbtcAssetId,
    name: 'sBTC',
    symbol: 'sBTC',
    decimals: 8,
    image: 'https://images.leather.io/tokens/sbtc.svg',
    principal: sbtcPrincipal,
  },
  [aeusdcPrincipal]: {
    assetIdentifier: `${aeusdcPrincipal}::aeUSDC`,
    name: 'Wrapped USDC',
    symbol: 'aeUSDC',
    decimals: 6,
    image: 'https://images.leather.io/tokens/usdc.svg',
    principal: aeusdcPrincipal,
  },
  [usdcxPrincipal]: {
    assetIdentifier: usdcxAssetId,
    name: 'USDCx',
    symbol: 'USDCx',
    decimals: 6,
    image: 'https://images.leather.io/tokens/usdcx.svg',
    principal: usdcxPrincipal,
  },
};

export const sip10Prices = {
  [longcoinPrincipal]: { price: 4.23105713004e-7, change24h: 0, priceChange: { '1d': 0 } },
  [sbtcPrincipal]: { price: 45000, change24h: 2.5, priceChange: { '1d': 2.5 } },
  [aeusdcPrincipal]: { price: 1.0, change24h: 0.01, priceChange: { '1d': 0.01 } },
  [usdcxPrincipal]: { price: 1.0, change24h: 0.02, priceChange: { '1d': 0.02 } },
};

export const sip10Analytics = {
  [longcoinPrincipal]: {
    trendingScore: 85,
    trustScore: 70,
    distributionScore: 60,
    holderCount: 5000,
    circulatingSupply: 1000000,
    updatedAt: '2026-01-01T00:00:00Z',
  },
  [sbtcPrincipal]: {
    trendingScore: 92,
    trustScore: 95,
    distributionScore: 80,
    holderCount: 25000,
    circulatingSupply: 5000,
    updatedAt: '2026-01-01T00:00:00Z',
  },
  [aeusdcPrincipal]: {
    trendingScore: 5,
    trustScore: 90,
    distributionScore: 75,
    holderCount: 15000,
    circulatingSupply: 50000000,
    updatedAt: '2026-01-01T00:00:00Z',
  },
  [usdcxPrincipal]: {
    trendingScore: 3,
    trustScore: 85,
    distributionScore: 70,
    holderCount: 10000,
    circulatingSupply: 30000000,
    updatedAt: '2026-01-01T00:00:00Z',
  },
};

export interface FtBalance {
  asset_identifier: string;
  balance: string;
}

export const fundedFtBalances: FtBalance[] = [
  { asset_identifier: `${longcoinPrincipal}::longcoin`, balance: '1888888000000' },
  { asset_identifier: `${lttPrincipal}::leather-test-token`, balance: '114736' },
  { asset_identifier: sbtcAssetId, balance: '50000000' },
  { asset_identifier: `${aeusdcPrincipal}::aeUSDC`, balance: '100000000' },
  { asset_identifier: usdcxAssetId, balance: '250000000' },
];
