import { renderToString } from 'react-dom/server';

import { createMoney } from '@leather.io/utils';

import type { DescriptorPsbtDetails } from '../hooks/use-descriptor-psbt-details';
import { PsbtDescriptorPolicy } from './psbt-descriptor-policy';

vi.mock('@leather.io/ui', () => ({
  Callout({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div>
        <span>{title}</span>
        <span>{children}</span>
      </div>
    );
  },
}));

vi.mock('@app/common/currency-formatter', () => ({
  formatCurrency: () => 'formatted-amount',
}));

vi.mock('@app/query/common/market-data/market-data.hooks', () => ({
  useCalculateBitcoinFiatValue: () => () => createMoney(0, 'USD'),
}));

const descriptor = 'wsh(pk(xpub-placeholder/0/*))';

const details: DescriptorPsbtDetails = {
  policyAddress: 'bc1q-policy-address',
  destinations: [
    { address: 'bc1q-destination-address', value: createMoney(12_000, 'BTC') },
    { address: null, value: createMoney(3_000, 'BTC') },
  ],
  amountLeavingPolicy: createMoney(15_000, 'BTC'),
  fee: createMoney(2_000, 'BTC'),
  hasDisallowedSighash: false,
};

describe(PsbtDescriptorPolicy.name, () => {
  test('titles the warning for an immediate broadcast when willBroadcast is set', () => {
    const html = renderToString(
      <PsbtDescriptorPolicy descriptor={descriptor} details={details} willBroadcast />
    );

    expect(html).toContain('Signing may broadcast this transaction');
    expect(html).toContain('Leather will broadcast this transaction immediately');
  });

  test('titles the warning as co-signing when no broadcast is requested', () => {
    const html = renderToString(<PsbtDescriptorPolicy descriptor={descriptor} details={details} />);

    expect(html).toContain('You are co-signing a contract transaction');
    expect(html).not.toContain('Leather will broadcast this transaction immediately');
  });

  test('renders the policy address, destinations and descriptor', () => {
    const html = renderToString(<PsbtDescriptorPolicy descriptor={descriptor} details={details} />);

    expect(html).toContain('bc1q-policy-address');
    expect(html).toContain('bc1q-destination-address');
    expect(html).toContain('Unknown recipient');
    expect(html).toContain(descriptor);
  });

  test('falls back to an unreadable-details callout when details are null', () => {
    const html = renderToString(<PsbtDescriptorPolicy descriptor={descriptor} details={null} />);

    expect(html).toContain('Unable to read transaction details');
    expect(html).not.toContain('Spending from policy');
    expect(html).toContain(descriptor);
  });
});
