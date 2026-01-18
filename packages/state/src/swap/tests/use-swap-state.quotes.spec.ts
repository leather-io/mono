import { act, waitFor } from '@testing-library/react';
import BigNumber from 'bignumber.js';
import { assert, describe, expect, it } from 'vitest';

import { createMoneyFromDecimal } from '@leather.io/utils';

import {
  createAccountSwapAsset,
  createSwapQuote,
  defaultBtcAsset,
  defaultSbtcAsset,
  defaultStxAsset,
} from './test-utils/fixtures';
import { renderUseSwapState } from './test-utils/render';

describe('quote enrichment and selection', () => {
  it('initializes with quotePolicy set to best', () => {
    const result = renderUseSwapState();
    expect(result.current.state.quotePolicy).toBe('best');
  });

  it('returns quotes and selected structure from quoteQuery', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });
    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 500_000_000, quote: 5_000_00 },
    });

    const quotes = [
      createSwapQuote({ targetAmount: 600_000_000, providerId: 'alex-sdk' }),
      createSwapQuote({ targetAmount: 550_000_000, providerId: 'velar-sdk' }),
      createSwapQuote({ targetAmount: 500_000_000, providerId: 'bitflow-sdk' }),
    ];

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      targetSwapAssets: [stxAsset],
      swapQuotes: quotes,
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(stxAsset);
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => {
      expect(result.current.quoteQuery.data).toBeDefined();
    });

    const quoteData = result.current.quoteQuery.data;
    assert(quoteData);
    expect(quoteData.quotes).toHaveLength(3);
    expect(quoteData.selected).toBeDefined();
    expect(quoteData.selected?.rawSwapQuote.targetAmount).toEqual(
      createMoneyFromDecimal(600_000_000, 'STX')
    );
  });

  it('selects the quote with highest target amount as best', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });
    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 500_000_000, quote: 5_000_00 },
    });

    const quotes = [
      createSwapQuote({ targetAmount: 400_000_000, providerId: 'bitflow-sdk' }),
      createSwapQuote({ targetAmount: 700_000_000, providerId: 'alex-sdk' }),
      createSwapQuote({ targetAmount: 550_000_000, providerId: 'velar-sdk' }),
    ];

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      targetSwapAssets: [stxAsset],
      swapQuotes: quotes,
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(stxAsset);
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => {
      expect(result.current.quoteQuery.data).toBeDefined();
    });

    const selected = result.current.quoteQuery.data?.selected;
    expect(selected?.rawSwapQuote.targetAmount).toEqual(createMoneyFromDecimal(700_000_000, 'STX'));
    expect(selected?.provider).toBe('alex-sdk');
  });

  it('enriches quotes with rate, score, and provider information', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });
    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 500_000_000, quote: 5_000_00 },
    });

    const quotes = [
      createSwapQuote({
        baseAmount: 100_000_000,
        targetAmount: 500_000_000,
        providerId: 'alex-sdk',
        dexPath: [
          {
            name: 'AlexLab',
            url: 'https://alexlab.co',
            logo: 'https://alexlab.co/logo.png',
            description: 'AlexLab DEX',
          },
        ],
      }),
    ];

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      targetSwapAssets: [stxAsset],
      swapQuotes: quotes,
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(stxAsset);
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => {
      expect(result.current.quoteQuery.data).toBeDefined();
    });

    const enrichedQuote = result.current.quoteQuery.data?.quotes[0];
    assert(enrichedQuote);
    expect(enrichedQuote.swapRate).toEqual(BigNumber(5));
    expect(enrichedQuote.score).toBe(enrichedQuote.targetAmount.amount.toNumber());
    expect(enrichedQuote.provider).toBe('alex-sdk');
    expect(enrichedQuote.targetAmount).toBeDefined();
    expect(enrichedQuote.dexPath).toHaveLength(1);
    expect(enrichedQuote.dexPath[0]).toHaveProperty('name', 'AlexLab');
    expect(enrichedQuote.assetPath).toHaveLength(2);
  });

  it('returns empty quotes and undefined selected when no quotes available', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });
    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 500_000_000, quote: 5_000_00 },
    });

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      targetSwapAssets: [stxAsset],
      swapQuotes: [],
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(stxAsset);
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => {
      expect(result.current.quoteQuery.data).toBeDefined();
    });

    expect(result.current.quoteQuery.data?.quotes).toEqual([]);
    expect(result.current.quoteQuery.data?.selected).toBeUndefined();
  });

  it('returns single quote as selected when only one quote available', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });
    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 500_000_000, quote: 5_000_00 },
    });

    const singleQuote = createSwapQuote({
      targetAmount: 450_000_000,
      providerId: 'velar-sdk',
    });

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      targetSwapAssets: [stxAsset],
      swapQuotes: [singleQuote],
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(stxAsset);
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => {
      expect(result.current.quoteQuery.data).toBeDefined();
    });

    expect(result.current.quoteQuery.data?.quotes).toHaveLength(1);
    expect(result.current.quoteQuery.data?.selected?.rawSwapQuote).toEqual(singleQuote);
  });

  it('calculates provider fee based on dex path length for stacks contract calls', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });
    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 500_000_000, quote: 5_000_00 },
    });

    const quotes = [
      createSwapQuote({
        executionType: 'stacks-contract-call',
        targetAmount: 500_000_000,
        providerId: 'alex-sdk',
        dexPath: [
          {
            name: 'AlexLab',
            url: 'https://alexlab.co',
            logo: 'https://alexlab.co/logo.png',
            description: 'AlexLab DEX',
          },
        ],
      }),
      createSwapQuote({
        executionType: 'stacks-contract-call',
        targetAmount: 450_000_000,
        providerId: 'velar-sdk',
        dexPath: [
          {
            name: 'Velar',
            url: 'https://velar.co',
            logo: 'https://velar.co/logo.png',
            description: 'Velar DEX',
          },
          {
            name: 'AlexLab',
            url: 'https://alexlab.co',
            logo: 'https://alexlab.co/logo.png',
            description: 'AlexLab DEX',
          },
        ],
      }),
      createSwapQuote({
        executionType: 'stacks-contract-call',
        targetAmount: 400_000_000,
        providerId: 'bitflow-sdk',
        dexPath: [
          {
            name: 'Bitflow',
            url: 'https://bitflow.finance',
            logo: 'https://bitflow.finance/logo.png',
            description: 'Bitflow DEX',
          },
          {
            name: 'Velar',
            url: 'https://velar.co',
            logo: 'https://velar.co/logo.png',
            description: 'Velar DEX',
          },
          {
            name: 'AlexLab',
            url: 'https://alexlab.co',
            logo: 'https://alexlab.co/logo.png',
            description: 'AlexLab DEX',
          },
        ],
      }),
    ];

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      targetSwapAssets: [stxAsset],
      swapQuotes: quotes,
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(stxAsset);
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => {
      expect(result.current.quoteQuery.data).toBeDefined();
    });

    const enrichedQuotes = result.current.quoteQuery.data?.quotes;
    assert(enrichedQuotes);
    expect(enrichedQuotes).toHaveLength(3);

    const singleDexQuote = enrichedQuotes.find(q => q.dexPath.length === 1);
    const doubleDexQuote = enrichedQuotes.find(q => q.dexPath.length === 2);
    const tripleDexQuote = enrichedQuotes.find(q => q.dexPath.length === 3);

    expect(singleDexQuote?.providerFeePercentage).toEqual(BigNumber(0.003));
    expect(doubleDexQuote?.providerFeePercentage).toEqual(BigNumber(0.006));
    expect(tripleDexQuote?.providerFeePercentage).toEqual(BigNumber(0.009));
  });

  it('does not add provider fee for sbtc bridge transfers', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });
    const sbtcAsset = createAccountSwapAsset({
      asset: defaultSbtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });

    const quotes = [
      createSwapQuote({
        executionType: 'sbtc-bridge-deposit',
        targetAmount: 500_000_000,
        providerId: 'sbtc-bridge',
        baseAsset: defaultBtcAsset,
        targetAsset: defaultSbtcAsset,
      }),
    ];

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      targetSwapAssets: [sbtcAsset],
      swapQuotes: quotes,
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(sbtcAsset);
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => {
      expect(result.current.quoteQuery.data).toBeDefined();
    });

    const bridgeQuote = result.current.quoteQuery.data?.quotes[0];
    assert(bridgeQuote);
    expect(bridgeQuote.providerFeePercentage).toBeUndefined();
    expect(bridgeQuote.rawSwapQuote.executionType).toBe('sbtc-bridge-deposit');
  });

  it('sorts quotes by score in descending order', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });
    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 500_000_000, quote: 5_000_00 },
    });

    const quotes = [
      createSwapQuote({ targetAmount: 300_000_000, providerId: 'bitflow-sdk' }),
      createSwapQuote({ targetAmount: 700_000_000, providerId: 'alex-sdk' }),
      createSwapQuote({ targetAmount: 500_000_000, providerId: 'velar-sdk' }),
      createSwapQuote({ targetAmount: 900_000_000, providerId: 'alex-sdk' }),
      createSwapQuote({ targetAmount: 100_000_000, providerId: 'bitflow-sdk' }),
    ];

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      targetSwapAssets: [stxAsset],
      swapQuotes: quotes,
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(stxAsset);
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => {
      expect(result.current.quoteQuery.data).toBeDefined();
    });

    const sortedQuotes = result.current.quoteQuery.data?.quotes;
    assert(sortedQuotes);
    expect(sortedQuotes).toHaveLength(5);

    for (let i = 1; i < sortedQuotes.length; i++) {
      expect(sortedQuotes[i - 1]?.score).toBeGreaterThanOrEqual(sortedQuotes[i]?.score ?? 0);
    }
  });

  it('sets score equal to targetAmount for all quotes', async () => {
    const btcAsset = createAccountSwapAsset({
      asset: defaultBtcAsset,
      balance: { crypto: 100_000_000, quote: 50_000_00 },
    });
    const stxAsset = createAccountSwapAsset({
      asset: defaultStxAsset,
      balance: { crypto: 500_000_000, quote: 5_000_00 },
    });

    const quotes = [
      createSwapQuote({
        executionType: 'stacks-contract-call',
        targetAmount: 456_789_000,
        providerId: 'alex-sdk',
      }),
      createSwapQuote({
        executionType: 'sbtc-bridge-deposit',
        targetAmount: 123_456_000,
        providerId: 'sbtc-bridge',
        baseAsset: defaultBtcAsset,
        targetAsset: defaultSbtcAsset,
      }),
      createSwapQuote({
        executionType: 'stacks-contract-call',
        targetAmount: 987_654_321,
        providerId: 'velar-sdk',
      }),
    ];

    const result = renderUseSwapState({
      baseSwapAssets: [btcAsset],
      targetSwapAssets: [stxAsset],
      swapQuotes: quotes,
    });

    act(() => {
      result.current.actions.setBaseSwapAsset(btcAsset);
      result.current.actions.setTargetSwapAsset(stxAsset);
      result.current.actions.setBaseAmount('0.1');
    });

    await waitFor(() => {
      expect(result.current.quoteQuery.data).toBeDefined();
    });

    const enrichedQuotes = result.current.quoteQuery.data?.quotes;
    assert(enrichedQuotes);
    expect(enrichedQuotes).toHaveLength(3);

    enrichedQuotes.forEach(enrichedQuote => {
      expect(enrichedQuote.score).toBe(enrichedQuote.rawSwapQuote.targetAmount.amount.toNumber());
    });
  });
});
