// @vitest-environment jsdom
import { type ReactElement, act } from 'react';
import { createRoot } from 'react-dom/client';

import BigNumber from 'bignumber.js';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { BaseCryptoAssetBalance, Money, Sip10Asset } from '@leather.io/models';

import { PortfolioAsset } from '../portfolio-table/portfolio-table';
import { PortfolioChart } from './portfolio-chart';

const xssSymbol = '<img src=x onerror="window.__xssFired = true">';

function createMoney(amount: string, symbol: string, decimals: number): Money {
  return { amount: new BigNumber(amount), symbol, decimals };
}

function createBalance(balance: Money, zero: Money): BaseCryptoAssetBalance {
  return {
    totalBalance: balance,
    availableBalance: balance,
    pendingBalance: balance,
    inboundBalance: zero,
    outboundBalance: zero,
  };
}

function createSip10PortfolioAsset(symbol: string, usdValue: string): PortfolioAsset {
  const asset: Sip10Asset = {
    chain: 'stacks',
    protocol: 'sip10',
    category: 'fungible',
    symbol,
    name: symbol,
    decimals: 6,
    hasMemo: false,
    canTransfer: true,
    assetId: 'SP000000000000000000002Q6VF78.token::token',
    contractId: 'SP000000000000000000002Q6VF78.token',
    imageCanonicalUri: '',
  };
  return {
    asset,
    crypto: createBalance(createMoney('1', symbol, 6), createMoney('0', symbol, 6)),
    quote: createBalance(createMoney(usdValue, 'USD', 2), createMoney('0', 'USD', 2)),
  };
}

interface ResizeEntryLike {
  contentRect: { width: number; height: number };
}

class MockResizeObserver {
  private callback: ((entries: ResizeEntryLike[]) => void) | null;
  constructor(callback: (entries: ResizeEntryLike[]) => void) {
    this.callback = callback;
  }
  observe() {
    this.callback?.([{ contentRect: { width: 600, height: 32 } }]);
  }
  disconnect() {
    this.callback = null;
  }
}

const mounted: { root: ReturnType<typeof createRoot>; container: HTMLElement }[] = [];

function mount(element: ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(element);
  });
  mounted.push({ root, container });
  return container;
}

beforeAll(() => {
  Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
  Reflect.set(globalThis, 'ResizeObserver', MockResizeObserver);
});

afterEach(() => {
  while (mounted.length) {
    const instance = mounted.pop();
    if (!instance) continue;
    act(() => {
      instance.root.unmount();
    });
    instance.container.remove();
  }
  document.querySelectorAll('.portfolio-tooltip').forEach(node => node.remove());
});

describe('PortfolioChart tooltip', () => {
  it('renders a malicious SIP-10 token symbol as inert text, not parsed HTML', () => {
    const container = mount(
      <PortfolioChart assets={[createSip10PortfolioAsset(xssSymbol, '1000000')]} />
    );

    const overlay = container.querySelector('rect.hover-overlay');
    expect(overlay).not.toBeNull();

    act(() => {
      overlay?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });

    const tooltip = document.querySelector('.portfolio-tooltip');
    expect(tooltip).not.toBeNull();
    expect(tooltip?.querySelector('img')).toBeNull();
    expect(tooltip?.textContent).toBe(`${xssSymbol}: 100.0%`);
  });
});
