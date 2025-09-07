/* eslint-disable */
import { SwapQuote } from '@/features/swap/temp/service';
import BigNumber from 'bignumber.js';

export const quotesSbtcBtc: SwapQuote[] = [
  {
    executionType: 'sbtc-bridge-transfer',
    providerId: 'sbtc-bridge',
    providerQuoteData: null,
    baseAmount: 0.005,
    targetAmount: 0.005,
    quote: {
      amount: BigNumber(500000),
      symbol: 'BTC',
      decimals: 8,
    },
    dexPath: [
      {
        name: 'sBTC Bridge',
        url: 'https://app.stacks.co/',
        logo: '',
        description: 'The Native Stacks sBTC Bridge',
      },
    ],
    assetPath: [
      {
        chain: 'stacks',
        category: 'fungible',
        protocol: 'sip10',
        canTransfer: true,
        assetId: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
        contractId: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
        decimals: 8,
        hasMemo: true,
        imageCanonicalUri:
          'https://ipfs.io/ipfs/bafkreiffe46h5voimvulxm2s4ddszdm4uli4rwcvx34cgzz3xkfcc2hiwi',
        name: 'sBTC',
        symbol: 'sBTC',
      },
      {
        chain: 'bitcoin',
        protocol: 'nativeBtc',
        symbol: 'BTC',
        category: 'fungible',
        decimals: 8,
        hasMemo: false,
      },
    ],
  },
];
