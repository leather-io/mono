import * as React from 'react';

import { describe, expect, it, vi } from 'vitest';

// Store protocol data that was passed to the component for verification
const renderedProtocols: Record<string, any> = {};

// Mock all dependencies
vi.mock('~/data/data', () => ({
  sbtcEnroll: {
    id: 'basic',
    title: 'Basic sBTC rewards',
    description: 'Test description',
    tvl: '2,150 BTC',
    tvlUsd: '$130,050,000',
    minCommitment: '0.005 BTC',
    minCommitmentUsd: '$302.50',
    apr: '4.9%',
    payoutToken: 'sBTC',
  },
  sbtcPools: [
    {
      id: 'alex',
      url: 'https://app.alexlab.co/pool',
      title: 'ALEX',
      description: 'Test ALEX description',
      tvl: '1,880 BTC',
      tvlUsd: '$113,960,000',
      minCommitment: '0.01 BTC',
      minCommitmentUsd: '$605.00',
      apr: '5.2%',
      payoutToken: ['sBTC', 'aBTC'],
    },
    {
      id: 'bitflow',
      url: 'https://app.bitflow.finance/sbtc#earn3',
      title: 'Bitflow',
      description: 'Test Bitflow description',
      tvl: '1,420 BTC',
      tvlUsd: '$86,020,000',
      minCommitment: '0.008 BTC',
      minCommitmentUsd: '$484.00',
      apr: '5.1%',
      payoutToken: ['sBTC', 'pBTC'],
    },
  ],
}));

vi.mock('./components/sbtc-protocol-reward-grid', () => ({
  SbtcProtocolRewardGrid: ({ rewardProtocol }: { rewardProtocol: any }) => {
    // Store the protocol data for verification
    renderedProtocols[rewardProtocol.id] = rewardProtocol;
    return null;
  },
}));

vi.mock('~/components/post-page-heading', () => ({
  PostPageHeading: () => null,
}));

vi.mock('~/components/post-section-heading', () => ({
  PostSectionHeading: () => null,
}));

vi.mock('~/components/apy-hero-card', () => ({
  ApyRewardHeroCard: () => null,
}));

vi.mock('~/features/sbtc-enroll/sbtc-enroll-button', () => ({
  SbtcEnrollButton: () => null,
}));

vi.mock('./components/get-sbtc-grid', () => ({
  GetSbtcGrid: () => null,
}));

vi.mock('./components/sbtc-rewards-faq', () => ({
  SbtcRewardsFaq: () => null,
}));

vi.mock('~/utils/post-utils', () => ({
  getPosts: () => ({}),
  formatPostPrompt: (prompt: string) => prompt,
}));

vi.mock('~/features/page/page', () => ({
  Page: {
    Header: () => null,
    Inset: ({ children }: { children: React.ReactNode }) => children,
  },
}));

vi.mock('~/store/addresses', () => ({
  useLeatherConnect: () => ({
    status: 'connected',
    whenExtensionState: Promise.resolve({}),
  }),
}));

describe('SbtcRewards', () => {
  it.skip('renders with data from sbtcPools', () => {
    // Import the component (after all mocks are set up)
    const { SbtcRewards } = require('./sbtc-rewards');

    // Render the component
    const element = React.createElement(SbtcRewards);
    React.createElement('div', null, element);

    // Verify the protocol data was passed correctly
    expect(renderedProtocols.basic.title).toBe('Basic sBTC rewards');
    expect(renderedProtocols.basic.tvl).toBe('2,150 BTC');
    expect(renderedProtocols.basic.apr).toBe('4.9%');
    expect(renderedProtocols.basic.payoutToken).toBe('sBTC');

    expect(renderedProtocols.alex.title).toBe('ALEX');
    expect(renderedProtocols.alex.tvl).toBe('1,880 BTC');
    expect(renderedProtocols.alex.apr).toBe('5.2%');
    expect(Array.isArray(renderedProtocols.alex.payoutToken)).toBe(true);
    expect(renderedProtocols.alex.payoutToken).toEqual(['sBTC', 'aBTC']);

    expect(renderedProtocols.bitflow.title).toBe('Bitflow');
    expect(renderedProtocols.bitflow.tvl).toBe('1,420 BTC');
    expect(renderedProtocols.bitflow.apr).toBe('5.1%');
    expect(Array.isArray(renderedProtocols.bitflow.payoutToken)).toBe(true);
    expect(renderedProtocols.bitflow.payoutToken).toEqual(['sBTC', 'pBTC']);
  });
});
