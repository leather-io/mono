import { btcAsset, stxAsset } from '@leather.io/constants';
import {
  CryptoAssetBalance,
  CryptoAssetId,
  Currency,
  ExecutionConstraint,
  Sip10Asset,
  StacksProtocol,
  SwapExecutionType,
  SwapProviderAsset,
  SwapProviderId,
  SwapQuote,
  SwappableFungibleCryptoAsset,
} from '@leather.io/models';
import { AccountRequest, AccountSwapAsset } from '@leather.io/services';
import { createMoney, createMoneyFromDecimal } from '@leather.io/utils';

export function createFungibleAsset(
  overrides: Partial<SwappableFungibleCryptoAsset> = {}
): SwappableFungibleCryptoAsset {
  const protocol = overrides.protocol ?? 'nativeBtc';

  switch (protocol) {
    case 'nativeBtc':
      return btcAsset;
    case 'nativeStx':
      return stxAsset;
    case 'sip10': {
      const symbol = overrides.symbol ?? 'TOKEN';
      return {
        chain: 'stacks',
        category: 'fungible',
        protocol: 'sip10',
        symbol,
        decimals: 6,
        hasMemo: false,
        name: 'Test Token',
        canTransfer: true,
        assetId: symbol,
        contractId: symbol,
        imageCanonicalUri: 'https://example.com/token.png',
        ...overrides,
      } as Sip10Asset;
    }
    default:
      throw new Error(`Unsupported protocol: ${protocol}`);
  }
}

function createBalance({
  amount = 0,
  symbol,
  decimals,
}: {
  amount: number;
  symbol: Currency;
  decimals: number;
}): CryptoAssetBalance {
  return {
    totalBalance: createMoney(amount, symbol, decimals),
    inboundBalance: createMoney(0, symbol, decimals),
    outboundBalance: createMoney(0, symbol, decimals),
    pendingBalance: createMoney(0, symbol, decimals),
    availableBalance: createMoney(amount, symbol, decimals),
  };
}

interface CreateAccountSwapAssetParams {
  asset: Partial<SwappableFungibleCryptoAsset>;
  balance?: {
    quote?: number;
    crypto?: number;
  };
  providerAssets?: SwapProviderAsset[];
}

export function createAccountSwapAsset({
  asset: assetOverrides,
  balance,
  providerAssets,
}: CreateAccountSwapAssetParams): AccountSwapAsset {
  const asset = createFungibleAsset(assetOverrides);
  const defaultProviderAssets: SwapProviderAsset[] = [
    {
      providerId: 'alex-sdk',
      providerAssetId: `${asset.protocol}-${asset.symbol}`,
      assetId: {
        protocol: asset.protocol,
        id: asset.protocol === 'sip10' ? asset.contractId : asset.symbol,
      },
    },
  ];

  const result: AccountSwapAsset = {
    asset,
    providerAssets: providerAssets ?? defaultProviderAssets,
  };

  if (balance) {
    const cryptoAmount = balance.crypto ?? 0;
    const quoteAmount = balance.quote ?? 0;

    result.balance = {
      quote: createBalance({
        amount: quoteAmount,
        symbol: 'USD',
        decimals: 2,
      }),
      crypto: createBalance({
        amount: cryptoAmount,
        symbol: asset.symbol,
        decimals: asset.decimals,
      }),
    };
  }

  return result;
}

export function createAccountRequest(): AccountRequest {
  return {
    account: {
      id: {
        fingerprint: 'test-fingerprint',
        accountIndex: 0,
      },
      bitcoin: {
        taprootDescriptor: 'tr(test)',
        nativeSegwitDescriptor: 'wpkh(test)',
      },
      stacks: {
        stxAddress: 'SP2ADDRESS',
      },
    },
  };
}

export const defaultBtcAsset = createFungibleAsset({ protocol: 'nativeBtc' });
export const defaultStxAsset = createFungibleAsset({ protocol: 'nativeStx' });
export const defaultSbtcAsset = createFungibleAsset({ protocol: 'sip10', symbol: 'sBTC' });
export const defaultABCDAsset = createFungibleAsset({
  protocol: 'sip10',
  symbol: 'ABCD',
  name: 'ABCD',
});

export const defaultBaseSwapAssets = [
  createAccountSwapAsset({
    asset: defaultBtcAsset,
    balance: { crypto: 100_000_000, quote: 50_000_00 },
  }),
  createAccountSwapAsset({
    asset: defaultStxAsset,
    balance: { crypto: 1_000_000_000, quote: 10_000_00 },
  }),
  createAccountSwapAsset({
    asset: defaultSbtcAsset,
    balance: { crypto: 100_000_000, quote: 50_000_00 },
  }),
  createAccountSwapAsset({
    asset: defaultABCDAsset,
    balance: { crypto: 100_000_000, quote: 1_000_00 },
  }),
];

export function getDefaultTargetSwapAssets(id: CryptoAssetId) {
  if (id.protocol === 'nativeBtc') {
    return [createAccountSwapAsset({ asset: defaultSbtcAsset })];
  } else return defaultBaseSwapAssets.filter(swapAsset => swapAsset.asset.protocol !== 'nativeBtc');
}

interface CreateSwapQuoteParams {
  executionType?: SwapExecutionType;
  providerId?: SwapProviderId;
  baseAmount?: number;
  targetAmount?: number;
  baseAsset?: SwappableFungibleCryptoAsset;
  targetAsset?: SwappableFungibleCryptoAsset;
  dexPath?: StacksProtocol[];
  isExecutable?: boolean;
  executionConstraints?: ExecutionConstraint[];
  createdAt?: Date;
  providerQuoteData?: unknown;
}

export function createSwapQuote({
  executionType = 'stacks-contract-call',
  providerId = 'alex-sdk',
  baseAmount = 100_000_000,
  targetAmount = 500_000_000,
  baseAsset = defaultBtcAsset,
  targetAsset = defaultStxAsset,
  dexPath = [
    {
      id: 'alex',
      name: 'AlexLab',
      url: 'https://alexlab.co',
      logo: 'https://alexlab.co/logo.png',
      description: 'AlexLab DEX',
    },
  ],
  isExecutable = true,
  executionConstraints = [],
  createdAt = new Date(),
  providerQuoteData = { valid: true },
}: CreateSwapQuoteParams = {}): SwapQuote {
  return {
    executionType,
    providerId,
    baseAsset,
    targetAsset,
    baseAmount: createMoneyFromDecimal(baseAmount, baseAsset.symbol, baseAsset.decimals),
    targetAmount: createMoneyFromDecimal(targetAmount, targetAsset.symbol, targetAsset.decimals),
    assetPath: [baseAsset, targetAsset],
    dexPath,
    isExecutable,
    executionConstraints,
    createdAt,
    providerQuoteData,
  } as SwapQuote;
}

export const defaultSwapQuotes = [
  createSwapQuote({
    targetAmount: 600_000_000,
    providerId: 'alex-sdk',
  }),
  createSwapQuote({
    targetAmount: 550_000_000,
    providerId: 'velar-sdk',
  }),
  createSwapQuote({
    targetAmount: 500_000_000,
    providerId: 'bitflow-sdk',
  }),
];
