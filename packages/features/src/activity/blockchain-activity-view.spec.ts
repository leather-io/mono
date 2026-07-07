import { describe, expect, it } from 'vitest';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type { BlockchainActivity, Money, Sip10Asset } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { createBlockchainActivityView } from './blockchain-activity-view';

const sbtcAsset: Sip10Asset = {
  chain: 'stacks',
  category: 'fungible',
  protocol: 'sip10',
  name: 'sBTC',
  symbol: 'sBTC',
  decimals: 8,
  hasMemo: false,
  canTransfer: true,
  assetId: 'sbtc',
  contractId: 'SP000.sbtc-token',
  imageCanonicalUri: '',
};

const ststxAsset: Sip10Asset = {
  ...sbtcAsset,
  name: 'Stacked STX',
  symbol: 'stSTX',
  assetId: 'ststx',
  contractId: 'SP000.ststx-token',
};

function formatMoney(money: Money) {
  return money.amount.toString();
}
const deps = { formatMoney };

function makeActivity(overrides: Partial<BlockchainActivity>): BlockchainActivity {
  return {
    timestamp: 1,
    txid: 'tx1',
    status: 'success',
    chain: 'stacks',
    initiatedByUser: true,
    action: 'send',
    balanceChanges: [],
    ...overrides,
  };
}

const sentBtc = {
  direction: 'sent' as const,
  asset: btcAsset,
  amount: { crypto: createMoney(5, 'BTC'), quote: createMoney(100, 'USD') },
};
const receivedStx = {
  direction: 'received' as const,
  asset: stxAsset,
  amount: { crypto: createMoney(9, 'STX'), quote: createMoney(90, 'USD') },
};

describe('createBlockchainActivityView', () => {
  it('renders a send: single avatar, symbol title, transfer subtitle, signed amount', () => {
    const view = createBlockchainActivityView(
      makeActivity({ action: 'send', counterparty: 'SP123', balanceChanges: [sentBtc] }),
      deps
    );
    expect(view.avatar).toEqual({ kind: 'single', asset: btcAsset });
    expect(view.indicator).toBe('sent');
    expect(view.title).toBe('BTC');
    expect(view.subtitle).toBe('Sent to SP123');
    expect(view.amount).toMatchObject({ direction: 'sent' });
    expect(view.amount?.crypto).toBeDefined();
  });

  it('drops the counterparty phrase when none is available (e.g. a self-send)', () => {
    const view = createBlockchainActivityView(
      makeActivity({ action: 'send', balanceChanges: [sentBtc] }),
      deps
    );
    expect(view.subtitle).toBe('Sent');

    const receive = createBlockchainActivityView(
      makeActivity({ action: 'receive', initiatedByUser: false, balanceChanges: [receivedStx] }),
      deps
    );
    expect(receive.subtitle).toBe('Received');
  });

  it('renders a receive using "from" wording', () => {
    const view = createBlockchainActivityView(
      makeActivity({
        action: 'receive',
        initiatedByUser: false,
        counterparty: 'SP999',
        balanceChanges: [receivedStx],
      }),
      deps
    );
    expect(view.indicator).toBe('received');
    expect(view.subtitle).toBe('Received from SP999');
  });

  it('conjugates status: pending/failed drive indicator and subtitle', () => {
    const pending = createBlockchainActivityView(
      makeActivity({
        action: 'send',
        status: 'pending',
        counterparty: 'SP1',
        balanceChanges: [sentBtc],
      }),
      deps
    );
    expect(pending.indicator).toBe('pending');
    expect(pending.subtitle).toBe('Sending to SP1');

    const failed = createBlockchainActivityView(
      makeActivity({
        action: 'send',
        status: 'failed',
        counterparty: 'SP1',
        balanceChanges: [sentBtc],
      }),
      deps
    );
    expect(failed.indicator).toBe('failed');
    expect(failed.subtitle).toBe('Sending failed to SP1');
    expect(failed.title).toBe('BTC');
  });

  it('renders a swap: dimmed-back pair, two-leg title, no right amount', () => {
    const view = createBlockchainActivityView(
      makeActivity({
        action: 'swap',
        protocol: 'bitflow',
        protocolName: 'Bitflow',
        balanceChanges: [sentBtc, receivedStx],
      }),
      deps
    );
    expect(view.avatar).toMatchObject({
      kind: 'pair',
      back: { asset: btcAsset, dimmed: true },
      front: { asset: stxAsset, dimmed: false },
    });
    expect(view.indicator).toBe('swap');
    expect(view.title).toBe('5 BTC → 9 STX');
    expect(view.subtitle).toBe('Swapped via Bitflow');
    expect(view.amount).toBeUndefined();
  });

  it('renders 2-token add-liquidity: undimmed pair, symbol-pair title, combined quote', () => {
    const secondSent = {
      direction: 'sent' as const,
      asset: sbtcAsset,
      amount: { crypto: createMoney(1, 'sBTC', 8), quote: createMoney(50, 'USD') },
    };
    const view = createBlockchainActivityView(
      makeActivity({
        action: 'add-liquidity',
        protocolName: 'Velar',
        balanceChanges: [sentBtc, secondSent],
      }),
      deps
    );
    expect(view.avatar).toMatchObject({
      kind: 'pair',
      back: { dimmed: false },
      front: { dimmed: false },
    });
    expect(view.title).toBe('BTC · sBTC');
    expect(view.subtitle).toBe('Added liquidity via Velar');
    expect(view.amount?.crypto).toBeUndefined();
    expect(view.amount?.quote.amount.toNumber()).toBe(150);
  });

  it('renders 1-token add-liquidity as a single-asset row', () => {
    const view = createBlockchainActivityView(
      makeActivity({ action: 'add-liquidity', protocolName: 'Velar', balanceChanges: [sentBtc] }),
      deps
    );
    expect(view.avatar).toEqual({ kind: 'single', asset: btcAsset });
    expect(view.title).toBe('BTC');
    expect(view.indicator).toBe('function');
    expect(view.amount).toMatchObject({ direction: 'sent' });
  });

  it('renders stack with hardcoded STX and the sent amount', () => {
    const sentStx = {
      direction: 'sent' as const,
      asset: stxAsset,
      amount: { crypto: createMoney(5000, 'STX'), quote: createMoney(7500, 'USD') },
    };
    const view = createBlockchainActivityView(
      makeActivity({ action: 'stack', protocolName: 'Stacking DAO', balanceChanges: [sentStx] }),
      deps
    );
    expect(view.avatar).toEqual({ kind: 'single', asset: stxAsset });
    expect(view.title).toBe('STX');
    expect(view.subtitle).toBe('Stacked via Stacking DAO');
    expect(view.amount).toMatchObject({ direction: 'sent' });
    expect(view.amount?.quote.amount.toNumber()).toBe(7500);
  });

  it('renders complete-unstack with the received amount', () => {
    const receivedStx = {
      direction: 'received' as const,
      asset: stxAsset,
      amount: { crypto: createMoney(5000, 'STX'), quote: createMoney(7500, 'USD') },
    };
    const view = createBlockchainActivityView(
      makeActivity({
        action: 'complete-unstack',
        protocolName: 'Stacking DAO',
        balanceChanges: [receivedStx],
      }),
      deps
    );
    expect(view.title).toBe('STX');
    expect(view.indicator).toBe('function');
    expect(view.amount).toMatchObject({ direction: 'received' });
  });

  it('drops "via {protocol}" when a protocol-action has no protocol name', () => {
    const view = createBlockchainActivityView(
      makeActivity({ action: 'stack', balanceChanges: [] }),
      deps
    );
    expect(view.subtitle).toBe('Stacked');
  });

  it('renders contract-execution with paper icon and via-contract subtitle', () => {
    const view = createBlockchainActivityView(
      makeActivity({
        action: 'contract-execution',
        protocolName: 'Arkadiko',
        contract: {
          type: 'call',
          contractId: 'SP123.vault-manager',
          functionName: 'collateralize',
        },
      }),
      deps
    );
    expect(view.avatar).toEqual({ kind: 'icon', icon: 'contract-call' });
    expect(view.title).toBe('collateralize');
    expect(view.subtitle).toBe('vault-manager - Arkadiko');
  });

  it('renders contract-deploy with a status-conjugated verb title', () => {
    const base = {
      action: 'contract-deploy' as const,
      contract: { type: 'deploy' as const, contractId: 'SP123.my-token' },
    };
    expect(
      createBlockchainActivityView(makeActivity({ ...base, status: 'pending' }), deps).title
    ).toBe('Deploying');
    expect(
      createBlockchainActivityView(makeActivity({ ...base, status: 'success' }), deps).title
    ).toBe('Deployed');
    expect(
      createBlockchainActivityView(makeActivity({ ...base, status: 'failed' }), deps).title
    ).toBe('Deploy failed');
    expect(createBlockchainActivityView(makeActivity({ ...base }), deps).subtitle).toBe('my-token');
  });

  it('degrades a pending protocol call with no balance changes to the contract-call shape', () => {
    const view = createBlockchainActivityView(
      makeActivity({
        action: 'swap',
        status: 'pending',
        protocolName: 'Bitflow',
        contract: { type: 'call', contractId: 'SP123.router', functionName: 'swap-x-for-y' },
        balanceChanges: [],
      }),
      deps
    );
    expect(view.avatar).toEqual({ kind: 'icon', icon: 'contract-call' });
    expect(view.title).toBe('swap-x-for-y');
    expect(view.subtitle).toBe('Swapping via Bitflow');
    expect(view.indicator).toBe('pending');
    expect(view.amount).toBeUndefined();
  });

  it('renders liquid-unstack with stSTX sent and STX received', () => {
    const sentStStx = {
      direction: 'sent' as const,
      asset: ststxAsset,
      amount: { crypto: createMoney(8, 'stSTX', 6), quote: createMoney(80, 'USD') },
    };
    const receivedStxLeg = {
      direction: 'received' as const,
      asset: stxAsset,
      amount: { crypto: createMoney(10, 'STX'), quote: createMoney(90, 'USD') },
    };
    const view = createBlockchainActivityView(
      makeActivity({
        action: 'liquid-unstack',
        protocolName: 'Stacking DAO',
        balanceChanges: [sentStStx, receivedStxLeg],
      }),
      deps
    );
    expect(view.avatar).toMatchObject({
      kind: 'pair',
      back: { asset: ststxAsset, dimmed: true },
      front: { asset: stxAsset, dimmed: false },
    });
    expect(view.title).toBe('8 stSTX → 10 STX');
    expect(view.subtitle).toBe('Liquid unstacked via Stacking DAO');
  });

  it('routes all copy through an injected translate', () => {
    function translate(template: string, values: Record<string, string> = {}) {
      return template.replace(/{(\w+)}/g, (_m, key) => values[key] ?? '').toUpperCase();
    }
    const view = createBlockchainActivityView(
      makeActivity({ action: 'send', counterparty: 'SP123', balanceChanges: [sentBtc] }),
      { formatMoney, translate }
    );
    expect(view.subtitle).toBe('SENT TO SP123');
  });

  it('carries txid, chain, and timestamp for routing and grouping', () => {
    const view = createBlockchainActivityView(
      makeActivity({
        txid: 'abc',
        chain: 'bitcoin',
        timestamp: 1727000000,
        balanceChanges: [sentBtc],
      }),
      deps
    );
    expect(view.txid).toBe('abc');
    expect(view.chain).toBe('bitcoin');
    expect(view.timestamp).toBe(1727000000);
    expect(view.key).toBe('bitcoin:abc');
  });
});
